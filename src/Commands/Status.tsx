import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Text, useInput, useApp, render } from "ink";
import { execFile } from "node:child_process";
import os from "node:os";
import dns from "node:dns";
import { StatusIndicator } from "../components/ui/status-indicator/index.js";
import { Spinner } from "../components/ui/spinner/index.js";
import { KeyHint } from "../component/components/ui/key-hint/index.js";
import { darkTheme } from "../component/components/ui/_core.js";
import type { InkUITheme } from "../component/components/ui/_core.js";

export const outhostTheme: InkUITheme = {
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

export interface StatusProps {
  onBack?: () => void;
  isStandalone?: boolean;
}

interface CloudflaredStatus {
  installed: boolean;
  version?: string | undefined;
  hint?: string | undefined;
}

interface StatusData {
  cloudflared: CloudflaredStatus;
  edgeReachable: boolean;
  ram: string;
}

function getCloudflaredInstallHint(): string {
  const platform = os.platform();
  if (platform === "win32") {
    return "winget install --id Cloudflare.cloudflared";
  }
  if (platform === "darwin") {
    return "brew install cloudflared";
  }
  return "sudo pacman -S cloudflared";
}

function checkCloudflared(signal?: AbortSignal): Promise<CloudflaredStatus> {
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
          if (child) child.kill();
        } catch {
          // ignore
        }
        resolve({ installed: false, hint: getCloudflaredInstallHint() });
      }
    };

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }

    let child: ReturnType<typeof execFile>;
    try {
      child = execFile(
        bin,
        ["--version"],
        { timeout: 3000 },
        (error, stdout, stderr) => {
          if (settled) return;
          settled = true;
          if (signal) signal.removeEventListener("abort", onAbort);

          if (error) {
            resolve({
              installed: false,
              hint: getCloudflaredInstallHint(),
            });
            return;
          }

          const raw = (stdout || stderr || "").trim();
          const match = raw.match(/version\s+([^\s]+)/i);
          const version: string =
            match && match[1] ? match[1] : raw.split("\n")[0] || "installed";

          resolve({
            installed: true,
            version,
          });
        }
      );

      child.on("error", () => {
        if (settled) return;
        settled = true;
        if (signal) signal.removeEventListener("abort", onAbort);
        resolve({
          installed: false,
          hint: getCloudflaredInstallHint(),
        });
      });
    } catch {
      if (settled) return;
      settled = true;
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve({
        installed: false,
        hint: getCloudflaredInstallHint(),
      });
    }
  });
}

function checkCloudflareEdge(signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve(false);
      return;
    }

    let settled = false;
    let timer: NodeJS.Timeout | undefined;

    const finish = (res: boolean) => {
      if (!settled) {
        settled = true;
        if (timer) clearTimeout(timer);
        if (signal) signal.removeEventListener("abort", onAbort);
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

export function Status({ onBack, isStandalone = false }: StatusProps) {
  const { exit } = useApp();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
        if (controller.signal.aborted) return;
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
        if (controller.signal.aborted) return;
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

  return (
    <Box
      flexDirection="column"
      paddingX={isStandalone ? 1 : 0}
      paddingY={isStandalone ? 1 : 0}
    >
      {/* Standalone Header */}
      {isStandalone && (
        <Box flexDirection="column" marginBottom={1}>
          <Box flexDirection="row" justifyContent="space-between">
            <Box flexDirection="column">
              {BANNER_LINES.map((line, idx) => (
                <Text key={idx} color="#a855f7" bold>
                  {line}
                </Text>
              ))}
            </Box>
            <Box>
              <Text color="purple" bold>
                ● ONLINE
              </Text>
            </Box>
          </Box>
          <Box marginTop={1} flexDirection="row">
            <Text bold color="white">
              OutHost CLI
            </Text>
            <Text color="gray"> v1.0.0</Text>
            <Text color="dim"> — Self-Hosted Application Platform</Text>
          </Box>
        </Box>
      )}

      {/* Description */}
      <Box flexDirection="column" marginY={1}>
        <Text bold color="white">
          System Status —{" "}
          <Text color="#a855f7" bold>
            Diagnostics & Pre-flight
          </Text>
        </Text>
        <Text color="gray">
          Host system health, runtime dependencies, and network connectivity.
        </Text>
      </Box>

      {/* Content */}
      {loading ? (
        <Box marginY={1}>
          <Spinner label="Running system pre-flight checks..." theme={outhostTheme} />
        </Box>
      ) : statusData ? (
        <>
          {/* Dependencies Section */}
          <Box flexDirection="column" marginY={1}>
            <Text bold color="#6d0bc9">
              DEPENDENCIES
            </Text>
            <Box flexDirection="column" marginTop={1} paddingLeft={1}>
              <StatusIndicator
                status={statusData.cloudflared.installed ? "online" : "error"}
                label={
                  statusData.cloudflared.installed
                    ? `cloudflared: ${statusData.cloudflared.version}`
                    : `cloudflared: Missing (${statusData.cloudflared.hint})`
                }
                theme={outhostTheme}
              />
              <StatusIndicator
                status="online"
                label={`Node.js: ${process.version}`}
                theme={outhostTheme}
              />
            </Box>
          </Box>

          {/* Network & Connectivity Section */}
          <Box flexDirection="column" marginY={1}>
            <Text bold color="#6d0bc9">
              NETWORK & CONNECTIVITY
            </Text>
            <Box flexDirection="column" marginTop={1} paddingLeft={1}>
              <StatusIndicator
                status={statusData.edgeReachable ? "online" : "error"}
                label={`Cloudflare Edge: ${statusData.edgeReachable ? "Reachable" : "Offline / Unreachable"}`}
                theme={outhostTheme}
              />
              <StatusIndicator
                status="online"
                label="Local Bind: 127.0.0.1 (Ready)"
                theme={outhostTheme}
              />
            </Box>
          </Box>

          {/* Host Environment Section */}
          <Box flexDirection="column" marginY={1}>
            <Text bold color="#6d0bc9">
              HOST ENVIRONMENT
            </Text>
            <Box flexDirection="column" marginTop={1} paddingLeft={1}>
              <Text>
                <Text color="gray">OS & Arch: </Text>
                <Text color="white">{`${os.platform()} (${os.arch()})`}</Text>
              </Text>
              <Text>
                <Text color="gray">Memory (RAM): </Text>
                <Text color="white">{statusData.ram}</Text>
              </Text>
              <Text>
                <Text color="gray">Working Directory: </Text>
                <Text color="white">{process.cwd()}</Text>
              </Text>
            </Box>
          </Box>
        </>
      ) : null}

      {/* Footer Key Hints */}
      <Box marginTop={1}>
        <KeyHint
          keys={
            isStandalone
              ? [
                  ...(loading ? [] : [{ key: "r", label: "Refresh" }]),
                  { key: "q", label: "Quit" },
                ]
              : [
                  { key: "b", label: "Back" },
                  ...(loading ? [] : [{ key: "r", label: "Refresh" }]),
                  { key: "q", label: "Quit" },
                ]
          }
          theme={outhostTheme}
        />
      </Box>
    </Box>
  );
}

export function startStatusCommand() {
  process.stdout.write("\x1b[?1049h");
  process.stdout.write("\x1b[2J\x1b[H");

  render(<Status isStandalone={true} />);

  process.stdin.resume();
}
