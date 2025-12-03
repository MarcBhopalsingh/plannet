import { Terminal } from '@plannet/io';
import { Task, TaskStats } from '@plannet/tasks';
import {
  formatEmptyState,
  formatHelpBar,
  formatInputRow,
  formatInputSeparator,
  formatSeparator,
  formatStats,
  formatTask,
} from './formatters';

export class Renderer {
  private readonly terminal: Terminal;

  constructor() {
    this.terminal = new Terminal();
  }

  enterAlternateScreen(): void {
    this.terminal.setupAlternateScreen();
  }

  exitAlternateScreen(): void {
    this.terminal.restoreMainScreen();
  }

  render(
    tasks: ReadonlyArray<Task>,
    selectedIndex: number,
    stats: TaskStats
  ): void {
    const terminalHeight = this.terminal.getRows();

    this.terminal.clearScreen();

    if (tasks.length === 0) {
      formatEmptyState().forEach((line) => this.terminal.writeLine(line));
      this.renderFooter(terminalHeight, false);
      return;
    }

    this.terminal.writeLine(formatStats(stats.total, stats.completed));

    tasks.forEach((task, index) => {
      this.terminal.writeLine(formatTask(task, index === selectedIndex));
    });

    this.renderFooter(terminalHeight, false);
  }

  renderInputMode(
    tasks: ReadonlyArray<Task>,
    stats: TaskStats,
    inputText: string
  ): void {
    const terminalHeight = this.terminal.getRows();
    const width = this.terminal.getColumns();

    this.terminal.clearScreen();
    this.terminal.writeLine(formatStats(stats.total, stats.completed));

    tasks.forEach((task) => {
      this.terminal.writeLine(formatTask(task, false));
    });

    this.terminal.writeLine(formatInputSeparator(width));
    this.terminal.writeLine(formatInputRow(inputText));

    this.renderFooter(terminalHeight, true);
  }

  private renderFooter(terminalHeight: number, inputMode: boolean): void {
    const width = this.terminal.getColumns();

    // Position cursor at bottom
    this.terminal.moveCursor(terminalHeight - 1, 0);
    this.terminal.writeLine(formatSeparator(width));
    this.terminal.write(formatHelpBar(inputMode));
  }
}
