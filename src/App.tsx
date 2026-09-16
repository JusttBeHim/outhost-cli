import React from "react";
import { render } from "ink";
import { Outhost } from "./Tui/OuthostTui.js";
import { OuthostCommand } from "./Outhost.js";

function App() {
  return <Outhost />;
}

export function startApp() {
  process.stdout.write("\x1b[?1049h");
  process.stdout.write("\x1b[2J\x1b[H");

  render(<App />);

  process.stdin.resume();
}
