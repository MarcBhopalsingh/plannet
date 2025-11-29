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
      const text = this.formatTaskText(task);
      if (index === selectedIndex) {
        this.terminal.writeLine(`\x1b[7m${text}\x1b[0m`);
      } else {
        this.terminal.writeLine(text);
      }
    });

    this.terminal.writeLine(this.renderHelpText());
  }

  private renderHelpText(): string {
    return '\n\x1b[2m  q: quit  •  ↑↓/jk: navigate  •  space: toggle\x1b[0m';
  }

  private formatTaskText(task: Task): string {
    const prefix = task.completed ? '[x]' : '[ ]';
    return `${prefix} ${task.description}`;
  }
}
