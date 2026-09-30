import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { ChildProcess } from 'node:child_process';
import { startStaticServer } from './server.js';
import { checkCloudflaredInstalled, startCloudflaredTunnel } from './tunnel.js';

export type DeployState = 
  | "IDLE"
  | "VALIDATING" 
  | "STARTING SERVER" 
  | "STARTING TUNNEL" 
  | "DEPLOYED" 
  | "FAILED";

export interface DeployStateData {
  state: DeployState;
  message?: string;
  localUrl?: string;
  publicUrl?: string;
}

export class Deployment {
  private server: http.Server | null = null;
  private tunnelProcess: ChildProcess | null = null;

  async deploy(targetPath: string, onUpdate: (data: DeployStateData) => void): Promise<void> {
    try {
      onUpdate({ state: "VALIDATING", message: "Deploying project..." });
      
      const absolutePath = path.resolve(targetPath);
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

      onUpdate({ state: "STARTING SERVER", message: "Deploying project..." });
      const { server, port } = await startStaticServer(absolutePath);
      this.server = server;
      const localUrl = `http://127.0.0.1:${port}`;

      onUpdate({ state: "STARTING TUNNEL", message: "Creating public URL..." });
      const cloudflaredBin = checkCloudflaredInstalled();
      
      const publicUrl = await startCloudflaredTunnel(cloudflaredBin, localUrl, (p) => {
        this.tunnelProcess = p;
      });
      
      onUpdate({ state: "DEPLOYED", localUrl, publicUrl });
      
    } catch (error: any) {
      this.cleanup();
      onUpdate({ state: "FAILED", message: error.message || "An unexpected error occurred." });
    }
  }

  cleanup() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    if (this.tunnelProcess) {
      this.tunnelProcess.kill();
      this.tunnelProcess = null;
    }
  }
}
