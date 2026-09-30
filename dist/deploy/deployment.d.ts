export type DeployState = "IDLE" | "VALIDATING" | "STARTING SERVER" | "STARTING TUNNEL" | "DEPLOYED" | "FAILED";
export interface DeployStateData {
    state: DeployState;
    message?: string;
    localUrl?: string;
    publicUrl?: string;
}
export declare class Deployment {
    private server;
    private tunnelProcess;
    deploy(targetPath: string, onUpdate: (data: DeployStateData) => void): Promise<void>;
    cleanup(): void;
}
//# sourceMappingURL=deployment.d.ts.map