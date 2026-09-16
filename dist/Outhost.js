#!/usr/bin/env node
import { Command } from "commander";
import { startApp } from "./App.js";
export const OuthostCommand = new Command();
OuthostCommand.name("outhost")
    .description("Start a Tui interface")
    .action(() => {
    startApp();
});
OuthostCommand.parse();
//# sourceMappingURL=Outhost.js.map