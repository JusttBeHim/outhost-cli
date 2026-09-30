import { ChildProcess } from 'node:child_process';
export declare function checkCloudflaredInstalled(): string;
export declare function startCloudflaredTunnel(bin: string, localUrl: string, onProcess: (p: ChildProcess) => void): Promise<string>;
//# sourceMappingURL=tunnel.d.ts.map