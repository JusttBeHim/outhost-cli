import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, execSync, ChildProcess } from 'node:child_process';
import os from 'node:os';
export class DeploymentService {
    server = null;
    cloudflaredProcess = null;
    async deploy(targetPath, onUpdate) {
        try {
            // 1. Validate path
            onUpdate({ state: "VALIDATING", message: "Validating project..." });
            const absolutePath = path.resolve(targetPath);
            if (!fs.existsSync(absolutePath)) {
                throw new Error("Directory does not exist.");
            }
            const stat = fs.statSync(absolutePath);
            if (!stat.isDirectory()) {
                throw new Error("Path is not a directory.");
            }
            // 2. Find index.html
            onUpdate({ state: "CHECKING SITE", message: "Checking for index.html..." });
            const indexPath = path.join(absolutePath, 'index.html');
            if (!fs.existsSync(indexPath)) {
                throw new Error("Deployment failed: index.html not found.");
            }
            // 3. Start static server
            onUpdate({ state: "STARTING SERVER", message: "Starting local server..." });
            const { server, port } = await this.startStaticServer(absolutePath);
            this.server = server;
            const localUrl = `http://127.0.0.1:${port}`;
            // 4. Check cloudflared
            onUpdate({ state: "STARTING CLOUDFLARE", message: "Checking cloudflared..." });
            const cloudflaredBin = os.platform() === 'win32' ? 'cloudflared.exe' : 'cloudflared';
            try {
                execSync(`${cloudflaredBin} --version`, { stdio: 'ignore' });
            }
            catch (err) {
                const installMsg = os.platform() === 'win32'
                    ? "Download it from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ and add it to your PATH."
                    : os.platform() === 'darwin'
                        ? "Install it using Homebrew: brew install cloudflare/cloudflare/cloudflared"
                        : "Install it following the instructions at https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/";
                throw new Error(`cloudflared is not installed.\n${installMsg}`);
            }
            // 5. Start cloudflared and 6. Detect public URL
            onUpdate({ state: "CREATING PUBLIC URL", message: "Starting tunnel..." });
            const publicUrl = await this.startCloudflared(cloudflaredBin, localUrl);
            // 7. Deployed
            onUpdate({ state: "DEPLOYED", localUrl, publicUrl });
        }
        catch (error) {
            this.cleanup();
            onUpdate({ state: "FAILED", message: error.message || "An unexpected error occurred." });
        }
    }
    startStaticServer(directory) {
        return new Promise((resolve, reject) => {
            const server = http.createServer((req, res) => {
                try {
                    const urlPath = req.url === '/' ? '/index.html' : req.url;
                    if (!urlPath) {
                        res.writeHead(400);
                        res.end();
                        return;
                    }
                    // Prevent directory traversal
                    const safeSuffix = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
                    const filePath = path.join(directory, safeSuffix);
                    if (!filePath.startsWith(directory)) {
                        res.writeHead(403);
                        res.end('Forbidden');
                        return;
                    }
                    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                        const ext = path.extname(filePath);
                        const mimeTypes = {
                            '.html': 'text/html',
                            '.js': 'text/javascript',
                            '.css': 'text/css',
                            '.json': 'application/json',
                            '.png': 'image/png',
                            '.jpg': 'image/jpg',
                            '.gif': 'image/gif',
                            '.svg': 'image/svg+xml',
                        };
                        const contentType = mimeTypes[ext] || 'application/octet-stream';
                        res.writeHead(200, { 'Content-Type': contentType });
                        fs.createReadStream(filePath).pipe(res);
                    }
                    else {
                        res.writeHead(404);
                        res.end('Not found');
                    }
                }
                catch (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                }
            });
            server.on('error', (e) => {
                reject(new Error(`Failed to start server: ${e.message}`));
            });
            server.listen(0, '127.0.0.1', () => {
                const address = server.address();
                if (address && typeof address !== 'string') {
                    resolve({ server, port: address.port });
                }
                else {
                    reject(new Error("Failed to get server port."));
                }
            });
        });
    }
    startCloudflared(bin, localUrl) {
        return new Promise((resolve, reject) => {
            this.cloudflaredProcess = spawn(bin, ['tunnel', '--url', localUrl]);
            let urlFound = false;
            const onData = (data) => {
                const output = data.toString();
                const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
                if (match && !urlFound) {
                    urlFound = true;
                    resolve(match[0]);
                }
            };
            this.cloudflaredProcess?.stdout?.on('data', onData);
            this.cloudflaredProcess?.stderr?.on('data', onData); // cloudflared usually logs to stderr
            this.cloudflaredProcess?.on('error', (err) => {
                if (!urlFound) {
                    reject(new Error(`Failed to start cloudflared: ${err.message}`));
                }
            });
            this.cloudflaredProcess?.on('close', (code) => {
                if (!urlFound) {
                    reject(new Error(`cloudflared exited with code ${code}`));
                }
            });
        });
    }
    cleanup() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
        if (this.cloudflaredProcess) {
            this.cloudflaredProcess.kill();
            this.cloudflaredProcess = null;
        }
    }
}
export const deploymentService = new DeploymentService();
//# sourceMappingURL=deploy.js.map