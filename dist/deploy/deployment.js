import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { ChildProcess } from 'node:child_process';
import { startStaticServer } from './server.js';
import { checkCloudflaredInstalled, startCloudflaredTunnel } from './tunnel.js';
export function normalizePath(inputPath) {
    if (!inputPath) {
        return '';
    }
    let cleaned = inputPath.trim();
    // Strip accidental wrapping single or double quotes
    while ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1).trim();
    }
    // Expand leading ~ to os.homedir()
    if (cleaned === '~') {
        cleaned = os.homedir();
    }
    else if (cleaned.startsWith('~/') || cleaned.startsWith('~\\')) {
        cleaned = path.join(os.homedir(), cleaned.slice(2));
    }
    // On non-Windows platforms (where \ is not path.sep), convert \ to / for cross-platform compatibility
    if (path.sep === '/') {
        cleaned = cleaned.replace(/\\/g, '/');
    }
    // Normalize mixed slashes and resolve to canonical absolute OS path
    const normalized = path.normalize(cleaned);
    return path.resolve(process.cwd(), normalized);
}
export class Deployment {
    server = null;
    stopServer = null;
    tunnelProcess = null;
    logs = [];
    lastState = null;
    onUpdateCallback = null;
    async deploy(targetPath, onUpdate) {
        this.onUpdateCallback = onUpdate;
        const emit = (data) => {
            this.lastState = data;
            onUpdate({ ...data, logs: [...this.logs] });
        };
        try {
            if (!targetPath || !targetPath.trim()) {
                throw new Error("Directory path cannot be empty.");
            }
            const absolutePath = normalizePath(targetPath);
            emit({ state: "VALIDATING", message: "Validating project...", targetPath: absolutePath });
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Directory does not exist: ${absolutePath}`);
            }
            const stat = fs.statSync(absolutePath);
            if (!stat.isDirectory()) {
                throw new Error(`Path is not a directory: ${absolutePath}`);
            }
            const indexPath = path.join(absolutePath, 'index.html');
            if (!fs.existsSync(indexPath)) {
                throw new Error(`Deployment failed: index.html not found in ${absolutePath}`);
            }
            emit({ state: "STARTING SERVER", message: "Deploying project...", targetPath: absolutePath });
            const { server, port, stop } = await startStaticServer(absolutePath, (entry) => {
                this.logs = [...this.logs.slice(-9), entry];
                if (this.lastState && this.onUpdateCallback) {
                    this.onUpdateCallback({ ...this.lastState, logs: [...this.logs] });
                }
            });
            this.server = server;
            this.stopServer = stop;
            const localUrl = `http://127.0.0.1:${port}`;
            emit({ state: "STARTING TUNNEL", message: "Creating public URL...", targetPath: absolutePath, localUrl });
            const cloudflaredBin = checkCloudflaredInstalled();
            const publicUrl = await startCloudflaredTunnel(cloudflaredBin, localUrl, (p) => {
                this.tunnelProcess = p;
            });
            emit({ state: "DEPLOYED", localUrl, publicUrl, targetPath: absolutePath });
        }
        catch (error) {
            this.cleanup();
            emit({ state: "FAILED", message: error.message || "An unexpected error occurred." });
        }
    }
    cleanup() {
        if (this.stopServer) {
            this.stopServer();
            this.stopServer = null;
            this.server = null;
        }
        else if (this.server) {
            this.server.close();
            this.server = null;
        }
        if (this.tunnelProcess) {
            this.tunnelProcess.kill();
            this.tunnelProcess = null;
        }
        this.logs = [];
        this.lastState = null;
        this.onUpdateCallback = null;
    }
}
//# sourceMappingURL=deployment.js.map