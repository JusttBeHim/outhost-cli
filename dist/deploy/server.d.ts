import http from 'node:http';
export interface RequestLogEntry {
    id: string;
    timestamp: string;
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
}
export type RequestLogCallback = (entry: RequestLogEntry) => void;
export interface StaticServerOptions {
    onRequestLog?: RequestLogCallback;
}
export interface StaticServerResult {
    server: http.Server;
    port: number;
    stop: () => void;
}
export declare function startStaticServer(directory: string, options?: StaticServerOptions | RequestLogCallback): Promise<StaticServerResult>;
//# sourceMappingURL=server.d.ts.map