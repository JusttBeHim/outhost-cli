import React, { useEffect } from "react";
import { Box, Text, useInput, useApp, render } from "ink";
import { KeyHint } from "../component/components/ui/key-hint/index.js";
import { darkTheme } from "../component/components/ui/_core.js";
import type { InkUITheme } from "../component/components/ui/_core.js";

const e = React.createElement;

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

export interface HelpProps {
  onBack?: () => void;
  isStandalone?: boolean;
}

export function Help({ onBack, isStandalone = false }: HelpProps) {
  const { exit } = useApp();

  const handleExit = () => {
    process.stdout.write("\x1b[?1049l\x1b[?25h");
    exit();
    process.exit(0);
  };

  useEffect(() => {
    if (isStandalone) {
      const cleanup = () => {
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
    if (isStandalone && (input === "q" || input === "Q")) {
      handleExit();
      return;
    }
    if (onBack && (input === "b" || input === "B" || key.escape)) {
      onBack();
      return;
    }
  });

  return e(
    Box,
    { flexDirection: "column", paddingX: isStandalone ? 1 : 0, paddingY: isStandalone ? 1 : 0 },
    // Standalone Header
    isStandalone &&
      e(
        Box,
        { flexDirection: "column", marginBottom: 1 },
        e(
          Box,
          { flexDirection: "row", justifyContent: "space-between" },
          e(
            Box,
            { flexDirection: "column" },
            BANNER_LINES.map((line, idx) =>
              e(Text, { key: idx, color: "#a855f7", bold: true }, line)
            )
          ),
          e(
            Box,
            null,
            e(Text, { color: "purple", bold: true }, "● ONLINE")
          )
        ),
        e(
          Box,
          { marginTop: 1, flexDirection: "row" },
          e(Text, { bold: true, color: "white" }, "OutHost CLI"),
          e(Text, { color: "gray" }, " v1.0.0"),
          e(Text, { color: "dim" }, " — Self-Hosted Application Platform")
        )
      ),

    // About / Description
    e(
      Box,
      { flexDirection: "column", marginY: 1 },
      e(
        Text,
        { bold: true, color: "white" },
        "OutHost — ",
        e(Text, { color: "#a855f7", bold: true }, "Simple. Local. Powerful.")
      ),
      e(
        Text,
        { color: "gray" },
        "Instantly deploy static websites from your local machine to the public web."
      )
    ),

    // Commands Section
    e(
      Box,
      { flexDirection: "column", marginY: 1 },
      e(Text, { bold: true, color: "#6d0bc9" }, "COMMANDS"),
      e(
        Box,
        { flexDirection: "column", marginTop: 1, paddingLeft: 1 },
        e(
          Box,
          { flexDirection: "row" },
          e(
            Box,
            { width: 30 },
            e(Text, { color: "#a855f7", bold: true }, "outhost")
          ),
          e(Text, { color: "gray" }, "Start interactive TUI dashboard")
        ),
        e(
          Box,
          { flexDirection: "row" },
          e(
            Box,
            { width: 30 },
            e(Text, { color: "#a855f7", bold: true }, "outhost deploy "),
            e(Text, { color: "cyan" }, "<path>")
          ),
          e(Text, { color: "gray" }, "Directly deploy a static website")
        ),
        e(
          Box,
          { flexDirection: "row" },
          e(
            Box,
            { width: 30 },
            e(Text, { color: "#a855f7", bold: true }, "outhost help")
          ),
          e(Text, { color: "gray" }, "Show this help screen")
        )
      )
    ),

    // Controls Section
    e(
      Box,
      { flexDirection: "column", marginY: 1 },
      e(Text, { bold: true, color: "#6d0bc9" }, "KEYBOARD CONTROLS"),
      e(
        Box,
        { flexDirection: "column", marginTop: 1, paddingLeft: 1 },
        e(
          Box,
          { flexDirection: "row" },
          e(
            Box,
            { width: 14 },
            e(Text, { color: "white", bold: true }, "↑ / ↓")
          ),
          e(Text, { color: "gray" }, "Navigate options")
        ),
        e(
          Box,
          { flexDirection: "row" },
          e(
            Box,
            { width: 14 },
            e(Text, { color: "white", bold: true }, "Enter")
          ),
          e(Text, { color: "gray" }, "Select / Confirm")
        ),
        !isStandalone &&
          e(
            Box,
            { flexDirection: "row" },
            e(
              Box,
              { width: 14 },
              e(Text, { color: "white", bold: true }, "b")
            ),
            e(Text, { color: "gray" }, "Back to main menu")
          ),
        e(
          Box,
          { flexDirection: "row" },
          e(
            Box,
            { width: 14 },
            e(Text, { color: "white", bold: true }, "q")
          ),
          e(Text, { color: "gray" }, "Quit OutHost")
        )
      )
    ),

    // Footer Key Hint
    e(
      Box,
      { marginTop: 1 },
      e(KeyHint, {
        keys: isStandalone
          ? [{ key: "q", label: "Quit" }]
          : [
              { key: "b", label: "Back" },
              { key: "q", label: "Quit" },
            ],
        theme: outhostTheme,
      })
    )
  );
}

export function startHelpCommand() {
  process.stdout.write("\x1b[?1049h");
  process.stdout.write("\x1b[2J\x1b[H");

  render(e(Help, { isStandalone: true }));

  process.stdin.resume();
}
