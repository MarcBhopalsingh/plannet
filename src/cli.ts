#!/usr/bin/env node

import { handleInteractive } from '@commands/interactive';
import { handleList } from '@commands/list';
import { handleAdd } from '@commands/add';
import { displayUsageAndExit } from '@commands/default';

function handleError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Error:', message);
  process.exit(1);
}

async function executeCommand(command: string, args: string[]): Promise<void> {
  switch (command) {
    case 'interactive':
    case 'i':
      await handleInteractive();
      break;
    case 'list':
    case 'ls':
      await handleList();
      break;
    case 'add':
    case 'a':
      if (args.length === 0) {
        console.error('Error: "add" command requires a task description');
        process.exit(1);
      }
      await handleAdd(args.join(' '));
      break;
    default:
      await displayUsageAndExit();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'default';
  const restArgs = args.slice(1);

  try {
    await executeCommand(command, restArgs);
    process.exit(0);
  } catch (error) {
    handleError(error);
  }
}

main();
