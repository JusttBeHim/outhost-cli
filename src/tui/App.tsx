import React, { useState } from "react";
import { Box, Text, useApp, useInput, useWindowSize } from "ink";

export default function App() {
  const { exit } = useApp();
  const { columns } = useWindowSize();
  const [input, setInput] = useState("");

  useInput((char, key) => {
    // Ctrl+C exits the TUI
    if (key.ctrl && char === "c") {
      exit();
      return;
    }

    // Backspace / Delete removes characters
    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    // Enter clears current input
    if (key.return) {
      setInput("");
      return;
    }

    // Printable characters appear after >
    if (
      char &&
      !key.ctrl &&
      !key.meta &&
      !key.return &&
      !key.escape &&
      !key.tab
    ) {
      setInput((prev) => prev + char);
    }
  });

  const width = columns && columns > 0 ? columns : 80;
  const horizontalLine = "─".repeat(width);

  return (
    <Box flexDirection="column" width="100%">
      {/* Top Branding Area */}
      <Box flexDirection="row" justifyContent="space-between" width="100%">
        <Box>
          <Text bold color="cyan">
            OUTHOST
          </Text>
          <Text color="gray"> v1</Text>
        </Box>
        <Text color="green">● Comming Soon</Text>
      </Box>
      <Text color="gray">Personal Hosting Server</Text>

      {/* Horizontal line above prompt */}
      <Box marginTop={2}>
        <Text color="gray" wrap="truncate">
          {horizontalLine}
        </Text>
      </Box>

      {/* Interactive Command Prompt */}
      <Box>
        <Text color="cyan" bold>
          &gt;{" "}
        </Text>
        <Text color="white">{input}</Text>
        <Text color="cyan">█</Text>
      </Box>

      {/* Horizontal line below prompt */}
      <Text color="gray" wrap="truncate">
        {horizontalLine}
      </Text>
    </Box>
  );
}
