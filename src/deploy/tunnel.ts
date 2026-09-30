import { spawn, execSync, ChildProcess } from 'node:child_process';
import os from 'node:os';

export function checkCloudflaredInstalled(): string {
  const bin = os.platform() === 'win32' ? 'cloudflared.exe' : 'cloudflared';
  try {
    execSync(`${bin} --version`, { stdio: 'ignore' });
    return bin;
  } catch (err) {
    const installMsg = os.platform() === 'win32' 
      ? "Download the deployment dependency and add it to your PATH."
      : os.platform() === 'darwin' 
      ? "Install the deployment dependency using Homebrew."
      : "Install the deployment dependency.";
    throw new Error(`Deployment dependency is not installed.\n${installMsg}`);
  }
}

export function startCloudflaredTunnel(bin: string, localUrl: string, onProcess: (p: ChildProcess) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(bin, ['tunnel', '--url', localUrl]);
    onProcess(childProcess);
    
    let urlFound = false;
    
    const onData = (data: Buffer) => {
      const output = data.toString();
      const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match && !urlFound) {
        urlFound = true;
        resolve(match[0]);
      }
    };

    childProcess.stdout?.on('data', onData);
    childProcess.stderr?.on('data', onData); // cloudflared usually logs to stderr

    childProcess.on('error', (err) => {
      if (!urlFound) {
        reject(new Error(`Failed to start deployment process: ${err.message}`));
      }
    });

    childProcess.on('close', (code) => {
      if (!urlFound) {
        reject(new Error(`Deployment process exited with code ${code}`));
      }
    });
  });
}
