export type DeployState = "IDLE" | "VALIDATING" | "CHECKING SITE" | "STARTING SERVER" | "STARTING CLOUDFLARE" | "CREATING PUBLIC URL" | "DEPLOYED" | "FAILED";
export interface DeployStateData {
    state: DeployState;
    message?: string;
    localUrl?: string;
    publicUrl?: string;
}
export declare class DeploymentService {
    private server;
    private cloudflaredProcess;
    deploy(targetPath: string, onUpdate: (data: DeployStateData) => void): Promise<void>;
    private startStaticServer;
    private startCloudflared;
    cleanup(): void;
}
export declare const deploymentService: DeploymentService;
//# sourceMappingURL=deploy.d.ts.map