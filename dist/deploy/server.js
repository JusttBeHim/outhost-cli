import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
export function startStaticServer(directory) {
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
//# sourceMappingURL=server.js.map