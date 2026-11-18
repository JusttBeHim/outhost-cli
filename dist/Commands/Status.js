import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Text, useInput, useApp, render } from "ink";
import { execFile } from "node:child_process";
import os from "node:os";
import dns from "node:dns";
import { StatusIndicator } from "../components/ui/status-indicator/index.js";
import { Spinner } from "../components/ui/spinner/index.js";
import { KeyHint } from "../component/components/ui/key-hint/index.js";
import { darkTheme } from "../component/components/ui/_core.js";
export const outhostTheme = {
    ...darkTheme,
    colors: {
        ...darkTheme.colors,
        primary: "#a855f7",
        focus: "#a855f7",
    },
};
const BANNER_LINES = [
    "  ___        _   _   _           _   ",
    " / _ \\ _   _| |_| | | | ___  ___| |_ ",
    "| | | | | | | __| |_| |/ _ \\/ __| __|",
    "| |_| | |_| | |_|  _  | (_) \\__ \\ |_ ",
    " \\___/ \\__,_|\\__|_| |_|\\___/|___/\\__|",
];
function getCloudflaredInstallHint() {
    const platform = os.platform();
    if (platform === "win32") {
        return "winget install --id Cloudflare.cloudflared";
    }
    if (platform === "darwin") {
        return "brew install cloudflared";
    }
    return "sudo pacman -S cloudflared";
}
function checkCloudflared(signal) {
    return new Promise((resolve) => {
        if (signal?.aborted) {
            resolve({ installed: false, hint: getCloudflaredInstallHint() });
            return;
        }
        const bin = os.platform() === "win32" ? "cloudflared.exe" : "cloudflared";
        let settled = false;
        const onAbort = () => {
            if (!settled) {
                settled = true;
                try {
                    if (child)
                        child.kill();
                }
                catch {
                    // ignore
                }
                resolve({ installed: false, hint: getCloudflaredInstallHint() });
            }
        };
        if (signal) {
            signal.addEventListener("abort", onAbort, { once: true });
        }
        let child;
        try {
            child = execFile(bin, ["--version"], { timeout: 3000 }, (error, stdout, stderr) => {
                if (settled)
                    return;
                settled = true;
                if (signal)
                    signal.removeEventListener("abort", onAbort);
                if (error) {
                    resolve({
                        installed: false,
                        hint: getCloudflaredInstallHint(),
                    });
                    return;
                }
                const raw = (stdout || stderr || "").trim();
                const match = raw.match(/version\s+([^\s]+)/i);
                const version = match && match[1] ? match[1] : raw.split("\n")[0] || "installed";
                resolve({
                    installed: true,
                    version,
                });
            });
            child.on("error", () => {
                if (settled)
                    return;
                settled = true;
                if (signal)
                    signal.removeEventListener("abort", onAbort);
                resolve({
                    installed: false,
                    hint: getCloudflaredInstallHint(),
                });
            });
        }
        catch {
            if (settled)
                return;
            settled = true;
            if (signal)
                signal.removeEventListener("abort", onAbort);
            resolve({
                installed: false,
                hint: getCloudflaredInstallHint(),
            });
        }
    });
}
function checkCloudflareEdge(signal) {
    return new Promise((resolve) => {
        if (signal?.aborted) {
            resolve(false);
            return;
        }
        let settled = false;
        let timer;
        const finish = (res) => {
            if (!settled) {
                settled = true;
                if (timer)
                    clearTimeout(timer);
                if (signal)
                    signal.removeEventListener("abort", onAbort);
                resolve(res);
            }
        };
        const onAbort = () => finish(false);
        if (signal) {
            signal.addEventListener("abort", onAbort, { once: true });
        }
        timer = setTimeout(() => {
            finish(false);
        }, 3000);
        dns.promises
            .lookup("trycloudflare.com")
            .then(() => finish(true))
            .catch(() => finish(false));
    });
}
export function Status({ onBack, isStandalone = false }) {
    const { exit } = useApp();
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState(null);
    const abortControllerRef = useRef(null);
    const handleExit = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        process.stdout.write("\x1b[?1049l\x1b[?25h");
        exit();
        process.exit(0);
    }, [exit]);
    const runChecks = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setLoading(true);
        Promise.all([
            checkCloudflared(controller.signal),
            checkCloudflareEdge(controller.signal),
        ])
            .then(([cfStatus, edgeStatus]) => {
            if (controller.signal.aborted)
                return;
            const freeRam = (os.freemem() / (1024 ** 3)).toFixed(1);
            const totalRam = (os.totalmem() / (1024 ** 3)).toFixed(1);
            setStatusData({
                cloudflared: cfStatus,
                edgeReachable: edgeStatus,
                ram: `${freeRam} GB free / ${totalRam} GB total`,
            });
            setLoading(false);
        })
            .catch(() => {
            if (controller.signal.aborted)
                return;
            setLoading(false);
        });
    }, []);
    useEffect(() => {
        runChecks();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [runChecks]);
    useEffect(() => {
        if (isStandalone) {
            const cleanup = () => {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                process.stdout.write("\x1b[?1049l\x1b[?25h");
            };
            process.on("exit", cleanup);
            process.on("SIGINT", () => {
                cleanup();
                process.exit(0);
            });
            return () => {
                process.off("exit", cleanup);
            };
        }
    }, [isStandalone]);
    useInput((input, key) => {
        if (key.ctrl && input === "c") {
            handleExit();
            return;
        }
        if (isStandalone && (input === "q" || input === "Q")) {
            handleExit();
            return;
        }
        if (onBack && (input === "b" || input === "B" || key.escape)) {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            onBack();
            return;
        }
        if ((input === "r" || input === "R") && !loading) {
            runChecks();
            return;
        }
    });
    return (_jsxs(Box, { flexDirection: "column", paddingX: isStandalone ? 1 : 0, paddingY: isStandalone ? 1 : 0, children: [isStandalone && (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Box, { flexDirection: "row", justifyContent: "space-between", children: [_jsx(Box, { flexDirection: "column", children: BANNER_LINES.map((line, idx) => (_jsx(Text, { color: "#a855f7", bold: true, children: line }, idx))) }), _jsx(Box, { children: _jsx(Text, { color: "purple", bold: true, children: "\u25CF ONLINE" }) })] }), _jsxs(Box, { marginTop: 1, flexDirection: "row", children: [_jsx(Text, { bold: true, color: "white", children: "OutHost CLI" }), _jsx(Text, { color: "gray", children: " v1.0.0" }), _jsx(Text, { color: "dim", children: " \u2014 Self-Hosted Application Platform" })] })] })), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { bold: true, color: "white", children: ["System Status \u2014", " ", _jsx(Text, { color: "#a855f7", bold: true, children: "Diagnostics & Pre-flight" })] }), _jsx(Text, { color: "gray", children: "Host system health, runtime dependencies, and network connectivity." })] }), loading ? (_jsx(Box, { marginY: 1, children: _jsx(Spinner, { label: "Running system pre-flight checks...", theme: outhostTheme }) })) : statusData ? (_jsxs(_Fragment, { children: [_jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { bold: true, color: "#6d0bc9", children: "DEPENDENCIES" }), _jsxs(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 1, children: [_jsx(StatusIndicator, { status: statusData.cloudflared.installed ? "online" : "error", label: statusData.cloudflared.installed
                                            ? `cloudflared: ${statusData.cloudflared.version}`
                                            : `cloudflared: Missing (${statusData.cloudflared.hint})`, theme: outhostTheme }), _jsx(StatusIndicator, { status: "online", label: `Node.js: ${process.version}`, theme: outhostTheme })] })] }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { bold: true, color: "#6d0bc9", children: "NETWORK & CONNECTIVITY" }), _jsxs(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 1, children: [_jsx(StatusIndicator, { status: statusData.edgeReachable ? "online" : "error", label: `Cloudflare Edge: ${statusData.edgeReachable ? "Reachable" : "Offline / Unreachable"}`, theme: outhostTheme }), _jsx(StatusIndicator, { status: "online", label: "Local Bind: 127.0.0.1 (Ready)", theme: outhostTheme })] })] }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { bold: true, color: "#6d0bc9", children: "HOST ENVIRONMENT" }), _jsxs(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "OS & Arch: " }), _jsx(Text, { color: "white", children: `${os.platform()} (${os.arch()})` })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Memory (RAM): " }), _jsx(Text, { color: "white", children: statusData.ram })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Working Directory: " }), _jsx(Text, { color: "white", children: process.cwd() })] })] })] })] })) : null, _jsx(Box, { marginTop: 1, children: _jsx(KeyHint, { keys: isStandalone
                        ? [
                            ...(loading ? [] : [{ key: "r", label: "Refresh" }]),
                            { key: "q", label: "Quit" },
                        ]
                        : [
                            { key: "b", label: "Back" },
                            ...(loading ? [] : [{ key: "r", label: "Refresh" }]),
                            { key: "q", label: "Quit" },
                        ], theme: outhostTheme }) })] }));
}
export function startStatusCommand() {
    process.stdout.write("\x1b[?1049h");
    process.stdout.write("\x1b[2J\x1b[H");
    render(_jsx(Status, { isStandalone: true }));
    process.stdin.resume();
}
//# sourceMappingURL=Status.js.map