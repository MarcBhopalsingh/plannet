import { Terminal } from '@ui/terminal';
import { Task } from '@types';

export class Renderer {
  constructor(private readonly terminal: Terminal) {}

  render(tasks: Task[], selectedIndex: number): void {
    this.terminal.clearScreen();

    if (tasks.length === 0) {
      this.terminal.writeLine('No tasks found.');
      this.terminal.writeLine('\nPress "q" to exit');
      return;
    }

    tasks.forEach((task, index) => {
      if (index === selectedIndex) {
        this.terminal.writeLine(`\x1b[7m${task}\x1b[0m`);
      } else {
        this.terminal.writeLine(`${task}`);
      }
    });

    this.terminal.writeLine(
      '\nPress "q" to exit | Use arrow keys or j/k to navigate'
    );
  }
}

