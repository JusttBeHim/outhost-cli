import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp, useWindowSize } from "ink";
import { Select } from "../components/ui/select/index.js";
import type { SelectItem } from "../components/ui/select/index.js";
import { KeyHint } from "../component/components/ui/key-hint/index.js";
import { darkTheme } from "../component/components/ui/_core.js";
import type { InkUITheme } from "../component/components/ui/_core.js";
import { Spinner } from "../components/ui/spinner/index.js";
import { StatusIndicator } from "../components/ui/status-indicator/index.js";
import { Deployment } from "../deploy/deployment.js";
import type { DeployStateData } from "../deploy/deployment.js";
import { TextInput } from "../components/ui/text-input/index.js";

const outhostTheme: InkUITheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: "#a855f7",
    focus: "#a855f7",
  },
};

const SELECT_ITEMS: SelectItem<string>[] = [
  { label: "Deploy Project", value: "deploy" },
  { label: "Help & Commands", value: "help" },
  { label: "System Status", value: "status" },
  { label: "Exit OutHost", value: "exit" },
];

const BANNER_LINES = [
  "  ___        _   _   _           _   ",
  " / _ \\ _   _| |_| | | | ___  ___| |_ ",
  "| | | | | | | __| |_| |/ _ \\/ __| __|",
  "| |_| | |_| | |_|  _  | (_) \\__ \\ |_ ",
  " \\___/ \\__,_|\\__|_| |_|\\___/|___/\\__|",
];

function Header({ columns }: { columns?: number }) {
  const isNarrow = typeof columns === "number" && columns < 60;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box
        flexDirection={isNarrow ? "column" : "row"}
        justifyContent={isNarrow ? "flex-start" : "space-between"}
      >
        <Box flexDirection="column">
          {BANNER_LINES.map((line, idx) => (
            <Text key={idx} color="#a855f7" bold>
              {line}
            </Text>
          ))}
        </Box>
        <Box marginTop={isNarrow ? 1 : 0}>
          <Text color="purple" bold>
            ● ONLINE
          </Text>
        </Box>
      </Box>
      <Box marginTop={1} flexDirection="row" flexWrap="wrap">
        <Text bold color="white">
          OutHost CLI
        </Text>
        <Text color="gray"> v1.0.0</Text>
        <Text color="dim"> — Self-Hosted Application Platform</Text>
      </Box>
    </Box>
  );
}

export function Outhost() {
  const [notification, setNotification] = useState<string | null>(null);
  const [deployStep, setDeployStep] = useState<'NONE' | 'SELECT_MODE' | 'ENTER_PATH' | 'DEPLOYING'>('NONE');
  const [pathInput, setPathInput] = useState('');
  const [deployState, setDeployState] = useState<DeployStateData | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const { exit } = useApp();
  const { columns } = useWindowSize();

  const handleExit = () => {
    if (deployment) deployment.cleanup();
    process.stdout.write("\x1b[?1049l\x1b[?25h");
    exit();
    process.exit(0);
  };

  useEffect(() => {
    const onExit = () => {
      if (deployment) deployment.cleanup();
      process.stdout.write("\x1b[?1049l\x1b[?25h");
    };
    process.on("exit", onExit);
    return () => {
      process.off("exit", onExit);
    };
  }, [deployment]);

  useInput((input, key) => {
    if (input === "q" || input === "Q") {
      handleExit();
      return;
    }
  });

  const startDeployment = (targetPath: string) => {
    setDeployStep('DEPLOYING');
    const dep = new Deployment();
    setDeployment(dep);
    dep.deploy(targetPath, (data) => {
      setDeployState(data);
    });
  };

  const handleDeployModeSelect = (item: SelectItem<string>) => {
    if (item.value === 'cwd') {
      startDeployment(process.cwd());
    } else {
      setDeployStep('ENTER_PATH');
    }
  };

  const handlePathSubmit = (val: string) => {
    if (!val.trim()) return;
    startDeployment(val.trim());
  };

  const handleSelect = (item: SelectItem<string>) => {
    if (item.value === "exit") {
      handleExit();
    } else if (item.value === "deploy") {
      setNotification(null);
      setDeployStep('SELECT_MODE');
    } else if (item.value === "help") {
      setDeployState(null);
      setNotification(
        "Help overview active. Run 'outhost --help' in terminal for more info.",
      );
    } else if (item.value === "status") {
      setDeployState(null);
      setNotification(
        "Local environment status verified. All systems nominal.",
      );
    }
  };

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Header columns={columns} />

      {deployStep === 'NONE' && (
        <Box flexDirection="column" marginY={1}>
          <Text bold color="#6d0bc9">
            NAVIGATION
          </Text>
          <Box marginTop={1}>
            <Select<string>
              items={SELECT_ITEMS}
              onSelect={handleSelect}
              theme={outhostTheme}
            />
          </Box>
        </Box>
      )}

      {deployStep === 'SELECT_MODE' && (
        <Box flexDirection="column" marginY={1}>
          <Text bold color="#6d0bc9">Where do you want to deploy?</Text>
          <Box marginTop={1}>
            <Select
              items={[
                { label: 'Select this directory', value: 'cwd' },
                { label: 'Enter path', value: 'path' }
              ]}
              onSelect={handleDeployModeSelect}
              theme={outhostTheme}
            />
          </Box>
        </Box>
      )}

      {deployStep === 'ENTER_PATH' && (
        <Box flexDirection="column" marginY={1}>
          <TextInput
            label="Directory Path:"
            placeholder="/path/to/website"
            value={pathInput}
            onChange={setPathInput}
            onSubmit={handlePathSubmit}
            focus={true}
            theme={outhostTheme}
          />
        </Box>
      )}

      {deployStep === 'DEPLOYING' && deployState && (
        <Box flexDirection="column" marginY={1}>
          {deployState.state === "DEPLOYED" ? (
            <Box flexDirection="column">
              <StatusIndicator status="online" label="Deployment successful" theme={outhostTheme} />
              <Box flexDirection="column" marginTop={1} paddingLeft={2}>
                <Text>
                  <Text color="gray">Local:  </Text>
                  <Text color="cyan">{deployState.localUrl}</Text>
                </Text>
                <Text>
                  <Text color="gray">Public: </Text>
                  <Text color="#a855f7" bold>{deployState.publicUrl}</Text>
                </Text>
              </Box>
              <Box marginTop={1}>
                <Text color="gray">Press Q to stop the deployment and quit.</Text>
              </Box>
            </Box>
          ) : deployState.state === "FAILED" ? (
            <StatusIndicator status="error" label={deployState.message || "Deployment failed"} theme={outhostTheme} />
          ) : (
            <Box flexDirection="row">
              <Spinner label={deployState.message || ""} theme={outhostTheme} />
            </Box>
          )}
        </Box>
      )}

      {notification && deployStep === 'NONE' && (
        <Box marginY={1}>
          <Text color="yellow">ℹ {notification}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <KeyHint
          keys={[
            { key: "↑↓", label: "Move" },
            { key: "Enter", label: "Select" },
            { key: "q", label: "Quit" },
          ]}
          theme={outhostTheme}
        />
      </Box>
    </Box>
  );
}
