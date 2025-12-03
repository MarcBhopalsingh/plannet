import { Terminal } from '@plannet/io';
import { getTaskStats } from '@plannet/tasks';
import {
  formatEmptyState,
  formatHeader,
  formatHelpBar,
  formatInputRow,
  formatInputSeparator,
  formatSeparator,
  formatStatusMessage,
  formatTask,
} from './formatters';
import { ProjectView, StatusMessage } from './project-view';

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
    const status = view.getStatus();

    this.terminal.clearScreen();
    this.terminal.writeLine(
      formatHeader(view.getTitle(), stats.total, stats.completed)
    );

    if (tasks.length === 0) {
      formatEmptyState().forEach((line) => this.terminal.writeLine(line));
      this.renderFooter(terminalHeight, false, status);
      return;
    }

    tasks.forEach((task, index) => {
      this.terminal.writeLine(
        formatTask(task, index === view.getSelectedIndex())
      );
    });

    this.renderFooter(terminalHeight, false, status);
  }

  renderInputMode(view: ProjectView, inputText: string): void {
    const terminalHeight = this.terminal.getRows();
    const width = this.terminal.getColumns();
    const tasks = view.getTasks();
    const stats = getTaskStats(tasks);

    this.terminal.clearScreen();
    this.terminal.writeLine(
      formatHeader(view.getTitle(), stats.total, stats.completed)
    );

    tasks.forEach((task) => {
      this.terminal.writeLine(formatTask(task, false));
    });

    this.terminal.writeLine(formatInputSeparator(width));
    this.terminal.writeLine(formatInputRow(inputText));

    // No status messages during input mode
    this.renderFooter(terminalHeight, true, null);
  }

  private renderFooter(
    terminalHeight: number,
    inputMode: boolean,
    status: StatusMessage | null
  ): void {
    const width = this.terminal.getColumns();

    // Calculate footer position (leave room for status if present)
    const footerHeight = status ? 3 : 2;
    this.terminal.moveCursor(terminalHeight - footerHeight, 0);

    if (status) {
      this.terminal.writeLine(formatStatusMessage(status.text, status.type));
    }

    this.terminal.writeLine(formatSeparator(width));
    this.terminal.write(formatHelpBar(inputMode));
  }
}
