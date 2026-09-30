#!/usr/bin/env node

import { Command } from "commander";
import { startApp } from "./App.js";
import { startDeployCommand } from "./Commands/Deploy.js";

export const OuthostCommand = new Command();

OuthostCommand.name("outhost")
  .description("Start a Tui interface")
  .action(() => {
    startApp();
  });

OuthostCommand.command("deploy")
  .description("Deploy a static website")
  .action(() => {
    startDeployCommand();
  });

OuthostCommand.parse();
