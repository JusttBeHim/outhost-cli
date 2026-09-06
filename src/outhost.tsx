import { Command } from "commander";
import React from "react";
import { render } from "ink";
import App from "./tui/App.js";

// buffer alter
export function outhostCommand() {
  process.stdout.write("\x1b[?1049h");
  console.clear();
  const { waitUntilExit } = render(<App />);
  waitUntilExit().then(() => {
    process.stdout.write("\x1b[?1049l");
  });
}

