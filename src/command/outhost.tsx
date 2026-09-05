import { Command } from "commander";
import React from "react";
import { render } from "ink";
import App from "../tui/App.js";

const program = new Command();

program.name("outhost").description("tun into server");

export function outhostCommand() {
  console.clear();
  render(<App />);
}
