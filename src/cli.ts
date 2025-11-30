#!/usr/bin/env node

import { handleInteractive } from '@plannet/commands';
import { handleList } from '@plannet/commands';
import { handleAdd } from '@plannet/commands';
import { displayUsage } from '@plannet/commands';

type CommandHandler = (args: string[]) => Promise<void>;

const handlers: Record<string, CommandHandler> = {
  interactive: handleInteractive,
  list: handleList,
  add: (args) => handleAdd(args.join(' ')),
};

async function executeCommand(command: string, args: string[]): Promise<void> {
  const handler = handlers[command];

  if (!handler) {
    displayUsage();
    throw new Error(`Unknown command: ${command}`);
  }

  return handler(args);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    displayUsage();
    return;
  }

  const command = args[0];
  const restArgs = args.slice(1);

  try {
    await executeCommand(command, restArgs);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error:', message);
    process.exit(1);
  }
}

main();
