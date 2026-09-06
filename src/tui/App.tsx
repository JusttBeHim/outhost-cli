import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";

interface HistoryItem {
  command: string;
  response: string;
}

export default function App() {
  const { exit } = useApp();
  const [input, setInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useInput((char, key) => {
    // Clean exit on Ctrl+C or Escape
    if (key.ctrl && char === "c") {
      exit();
      return;
    }

    if (key.escape) {
      if (showHelp) {
        setShowHelp(false);
        return;
      }
      exit();
      return;
    }

    // Toggle help on '?' when input buffer is empty
    if (char === "?" && input.length === 0) {
      setShowHelp((prev) => !prev);
      return;
    }

    // Backspace / Delete handling
    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    // Return (Enter) handling
    if (key.return) {
      const trimmed = input.trim();
      if (trimmed.length === 0) {
        return;
      }

      if (trimmed === "exit" || trimmed === "quit" || trimmed === "q") {
        exit();
        return;
      }

      if (trimmed === "clear") {
        setHistory([]);
        setInput("");
        return;
      }

      if (trimmed === "help" || trimmed === "?") {
        setShowHelp((prev) => !prev);
      }

      // Display typed command in terminal history
      setHistory((prev) => [...prev, { command: trimmed, response: trimmed }]);
      setInput("");
      return;
    }

    // Printable characters
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

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      width="100%"
    >
      {/* Top Identity Area — brand mark is the actual glyph, no ASCII art needed */}
      <Box flexDirection="row" justifyContent="space-between" width="100%">
        <Box>
          <Text bold color="cyan">
            &gt;_ OUTHOST
          </Text>
          <Text color="gray"> v0.1</Text>
        </Box>
        <Box>
          <Text color="green">● </Text>
          <Text dimColor>Coming soon</Text>
        </Box>
      </Box>
      <Text color="gray">Personal Hosting Server</Text>

      {/* Terminal Command History */}
      {history.map((item, index) => (
        <Box key={index} flexDirection="column" marginTop={1}>
          <Box>
            <Text color="cyan" bold>
              &gt;{" "}
            </Text>
            <Text color="white">{item.command}</Text>
          </Box>
          <Text color="gray">{item.response}</Text>
        </Box>
      ))}

      {/* Interactive Command Prompt */}
      <Box marginTop={1}>
        <Text color="cyan" bold>
          &gt;{" "}
        </Text>
        <Text color="white">{input}</Text>
        <Text color="cyan">█</Text>
      </Box>

      {/* Minimal Footer Hint */}
      {!showHelp && history.length === 0 && input.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>? for help · Ctrl+C to exit</Text>
        </Box>
      )}
    </Box>
  );
}
