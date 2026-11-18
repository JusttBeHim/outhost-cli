#!/usr/bin/env node

import { Command } from "commander";
import { startApp } from "./App.js";
import { startDeployCommand } from "./Commands/Deploy.js";
import { startHelpCommand } from "./Commands/Help.js";
import { startStatusCommand } from "./Commands/Status.js";

export const OuthostCommand = new Command();

OuthostCommand.name("outhost")
  .description("Start a Tui interface")
  .helpOption(false)
  .option("-h, --help", "Display help and commands")
  .action((options) => {
    if (options.help) {
      startHelpCommand();
    } else {
      startApp();
    }
  });

OuthostCommand.command("help")
  .description("Display help and commands")
  .action(() => {
    startHelpCommand();
  });

OuthostCommand.command("deploy [path]")
  .description("Deploy a static website")
  .action((targetPath?: string) => {
    startDeployCommand(targetPath);
  });

OuthostCommand.command("status")
  .description("Check system status and dependencies")
  .action(() => {
    startStatusCommand();
  });

OuthostCommand.parse();
