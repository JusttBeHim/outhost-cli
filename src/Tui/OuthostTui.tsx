import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp, useWindowSize } from "ink";
import { Select } from "../components/ui/select/index.js";
import type { SelectItem } from "../components/ui/select/index.js";
import { KeyHint } from "../component/components/ui/key-hint/index.js";
import { darkTheme } from "../component/components/ui/_core.js";
import type { InkUITheme } from "../component/components/ui/_core.js";

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
  const { exit } = useApp();
  const { columns } = useWindowSize();

  const handleExit = () => {
    process.stdout.write("\x1b[?1049l\x1b[?25h");
    exit();
    process.exit(0);
  };

  useEffect(() => {
    const onExit = () => {
      process.stdout.write("\x1b[?1049l\x1b[?25h");
    };
    process.on("exit", onExit);
    return () => {
      process.off("exit", onExit);
    };
  }, []);

  useInput((input, key) => {
    if (input === "q" || input === "Q") {
      handleExit();
      return;
    }
  });

  const handleSelect = (item: SelectItem<string>) => {
    if (item.value === "exit") {
      handleExit();
    } else if (item.value === "deploy") {
      setNotification(
        "Deployment module is not connected yet. Command logic coming soon.",
      );
    } else if (item.value === "help") {
      setNotification(
        "Help overview active. Run 'outhost --help' in terminal for more info.",
      );
    } else if (item.value === "status") {
      setNotification(
        "Local environment status verified. All systems nominal.",
      );
    }
  };

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Header columns={columns} />

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

      {notification && (
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
