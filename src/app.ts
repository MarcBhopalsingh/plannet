import * as readline from 'readline';
import { onKeypress } from './input.js';
import { Terminal } from './ui/terminal.js';

const terminal = new Terminal();

export function setupAlternateScreen(): void {
  terminal.setupAlternateScreen();
}

export function restoreMainScreen(): void {
  terminal.restoreMainScreen();
}

export async function run(tasks: string[]): Promise<void> {
  let selectedIndex = 0;

  renderTasks(tasks, selectedIndex);

  return new Promise((resolve) => {
    const cleanup = onKeypress((str: string, key: readline.Key) => {
      if (key.name === 'q') {
        restoreMainScreen();
        cleanup();
        resolve();
      } else if (
        key.name === 'up' ||
        (key.name === 'k' && key.ctrl === false)
      ) {
        if (tasks.length > 0) {
          selectedIndex = Math.max(0, selectedIndex - 1);
          renderTasks(tasks, selectedIndex);
        }
      } else if (
        key.name === 'down' ||
        (key.name === 'j' && key.ctrl === false)
      ) {
        if (tasks.length > 0) {
          selectedIndex = Math.min(tasks.length - 1, selectedIndex + 1);
          renderTasks(tasks, selectedIndex);
        }
      }
    });
  });
}

function renderTasks(tasks: string[], selectedIndex: number): void {
  terminal.clearScreen();

  if (tasks.length === 0) {
    process.stdout.write('No tasks found.\n');
    process.stdout.write('\nPress "q" to exit\n');
    return;
  }

  tasks.forEach((task, index) => {
    if (index === selectedIndex) {
      process.stdout.write(`\x1b[7m${task}\x1b[0m\n`);
    } else {
      process.stdout.write(`${task}\n`);
    }
  });

  process.stdout.write(
    '\nPress "q" to exit | Use arrow keys or j/k to navigate\n'
  );
}
