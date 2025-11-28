#!/usr/bin/env node

import { appendFile, readFile } from 'fs/promises';
import { run } from './app.js';

const TASKS_FILE = 'tasks.txt';

// Command handlers
async function handleInteractive(): Promise<void> {
  await displayTasks();
  await run();
}

async function handleList(): Promise<void> {
  await displayTasks();
}

async function handleAdd(taskText: string): Promise<void> {
  await appendFile(TASKS_FILE, taskText + '\n');
}

async function handleDefault(): Promise<void> {
  console.log('No command provided');
  console.log('Usage: plannet <command>');
  console.log('Commands:');
  console.log('  interactive - Run in interactive mode');
  console.log('  list - List all tasks');
  console.log('  add - Add a new task');
  console.log('  help - Show help');
  process.exit(0);
}

// Utility functions
async function displayTasks(): Promise<void> {
  try {
    const content = await readFile(TASKS_FILE, 'utf-8');
    process.stdout.write(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist yet, silently continue
      return;
    }
    throw error;
  }
}

function handleError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Error:', message);
  process.exit(1);
}

// Command routing
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
      await handleDefault();
  }
}

// Main CLI logic
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
