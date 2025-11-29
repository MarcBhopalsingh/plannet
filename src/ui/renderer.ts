import { Terminal } from '@ui/terminal';
import { Task } from '@types';

const ANSI = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  GREEN: '\x1b[32m',
  STRIKETHROUGH: '\x1b[9m',
} as const;

const CHECKBOX = {
  COMPLETED: '✓',
  INCOMPLETE: '☐',
} as const;

export class Renderer {
  constructor(private readonly terminal: Terminal) {}

  render(
    tasks: Task[],
    selectedIndex: number,
    stats: { total: number; completed: number }
  ): void {
    this.terminal.clearScreen();

    if (tasks.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.renderStatsLine(stats.total, stats.completed);
    this.renderTaskList(tasks, selectedIndex);
    this.terminal.writeLine(this.renderHelpText());
  }

  private renderEmptyState(): void {
    this.terminal.writeLine(
      `${ANSI.DIM}  No tasks yet. Add one to get started!${ANSI.RESET}`
    );
    this.terminal.writeLine(this.renderHelpText());
  }

  private renderStatsLine(total: number, completed: number): void {
    this.terminal.writeLine(
      `${ANSI.DIM}  ${total} task${
        total !== 1 ? 's' : ''
      } • ${completed} completed${ANSI.RESET}\n`
    );
  }

  private renderTaskList(tasks: Task[], selectedIndex: number): void {
    tasks.forEach((task, index) => {
      const text = this.formatTaskText(task, index === selectedIndex);
      this.terminal.writeLine(text);
    });
  }

  private renderHelpText(): string {
    return `\n${ANSI.DIM}  q: quit  •  ↑↓/jk: navigate  •  space: toggle${ANSI.RESET}`;
  }

  private formatTaskText(task: Task, isSelected: boolean): string {
    const checkbox = task.completed
      ? `${ANSI.GREEN}${CHECKBOX.COMPLETED}${ANSI.RESET}`
      : `${ANSI.DIM}${CHECKBOX.INCOMPLETE}${ANSI.RESET}`;
    const cursor = isSelected ? `${ANSI.BOLD}→${ANSI.RESET} ` : '  ';

    let description = task.description;
    if (task.completed) {
      description = `${ANSI.DIM}${ANSI.STRIKETHROUGH}${description}${ANSI.RESET}`;
    }

    const selectionStyle = isSelected ? ANSI.BOLD : '';
    const resetStyle = isSelected ? ANSI.RESET : '';

    return `${cursor}${selectionStyle}[${checkbox}] ${description}${resetStyle}`;
  }
}
