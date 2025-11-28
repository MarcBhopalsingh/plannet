#!/usr/bin/env node

import { run, setupAlternateScreen } from './app.js';
import { TaskService } from './services/task-service.js';

const taskService = new TaskService();

async function handleInteractive(): Promise<void> {
  setupAlternateScreen();
  const tasks = await taskService.loadTasks();
  await run(tasks);
}

async function handleList(): Promise<void> {
  await displayTasks();
}

async function handleAdd(taskText: string): Promise<void> {
  await taskService.addTask(taskText);
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

async function displayTasks(): Promise<void> {
  const tasks = await taskService.loadTasks();
  process.stdout.write(tasks.join('\n') + '\n');
}

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
      await handleDefault();
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
