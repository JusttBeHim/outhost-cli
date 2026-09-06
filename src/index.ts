#!/usr/bin/env node
import { Command } from "commander";
import { outhostCommand } from "./outhost.js";

const program = new Command();

program
  .name("outhost")
  .description("turn into server")
  .action(() => {
    outhostCommand();
  });
program.parse();

