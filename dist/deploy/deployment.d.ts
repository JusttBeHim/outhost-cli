import type { RequestLogEntry } from './server.js';
export type { RequestLogEntry };
export declare function normalizePath(inputPath: string): string;
export type DeployState = "IDLE" | "VALIDATING" | "STARTING SERVER" | "STARTING TUNNEL" | "DEPLOYED" | "FAILED";
export interface DeployStateData {
    state: DeployState;
    message?: string;
    localUrl?: string;
    publicUrl?: string;
    targetPath?: string;
    logs?: RequestLogEntry[];
}
export declare class Deployment {
    private server;
    private stopServer;
    private tunnelProcess;
    private logs;
    private lastState;
    private onUpdateCallback;
    deploy(targetPath: string, onUpdate: (data: DeployStateData) => void): Promise<void>;
    cleanup(): void;
}
//# sourceMappingURL=deployment.d.ts.map