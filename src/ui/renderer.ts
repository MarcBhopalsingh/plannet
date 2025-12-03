import { Terminal } from '@plannet/io';
import { getTaskStats } from '@plannet/tasks';
import {
  formatEmptyState,
  formatHelpBar,
  formatInputRow,
  formatInputSeparator,
  formatProjectTitle,
  formatSeparator,
  formatStats,
  formatTask,
} from './formatters';
import { ProjectView } from './project-view';

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

  render(view: ProjectView): void {
    const terminalHeight = this.terminal.getRows();
    const tasks = view.getTasks();
    const stats = getTaskStats(tasks);

    this.terminal.clearScreen();
    this.terminal.writeLine(formatProjectTitle(view.getTitle()));

    if (tasks.length === 0) {
      formatEmptyState().forEach((line) => this.terminal.writeLine(line));
      this.renderFooter(terminalHeight, false);
      return;
    }

    this.terminal.writeLine(formatStats(stats.total, stats.completed));

    tasks.forEach((task, index) => {
      this.terminal.writeLine(
        formatTask(task, index === view.getSelectedIndex())
      );
    });

    this.renderFooter(terminalHeight, false);
  }

  renderInputMode(view: ProjectView, inputText: string): void {
    const terminalHeight = this.terminal.getRows();
    const width = this.terminal.getColumns();
    const tasks = view.getTasks();
    const stats = getTaskStats(tasks);

    this.terminal.clearScreen();
    this.terminal.writeLine(formatProjectTitle(view.getTitle()));
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
