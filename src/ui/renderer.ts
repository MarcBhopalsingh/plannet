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
import { WorkspaceView } from './workspace-view';

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

  render(workspace: WorkspaceView): void {
    const terminalHeight = this.terminal.getRows();
    const projectViews = workspace.getAllProjectViews();
    const activeIndex = workspace.getActiveProjectIndex();

    this.terminal.clearScreen();

    // Render all projects with spacing between them
    for (let i = 0; i < projectViews.length; i++) {
      // Add blank line between projects (not before first)
      if (i > 0) {
        this.terminal.writeLine('');
      }
      const isActive = i === activeIndex;
      this.renderProject(projectViews[i], isActive);
    }

    // Get status from active project
    const status = workspace.getActiveProjectView().getStatus();
    this.renderFooter(terminalHeight, false, status);
  }

  private renderProject(view: ProjectView, isActive: boolean): void {
    const tasks = view.getTasks();
    const stats = getTaskStats(tasks);
    const isCollapsed = view.isCollapsed();

    this.terminal.writeLine(
      formatHeader(
        view.getTitle(),
        stats.total,
        stats.completed,
        isActive,
        isCollapsed
      )
    );

    // Don't render tasks if collapsed
    if (isCollapsed) {
      return;
    }

    if (tasks.length === 0) {
      if (isActive) {
        formatEmptyState().forEach((line) => this.terminal.writeLine(line));
      }
      return;
    }

    tasks.forEach((task, index) => {
      // Only show cursor in the active project
      const showCursor = isActive && index === view.getSelectedIndex();
      this.terminal.writeLine(formatTask(task, showCursor));
    });
  }

  renderInputMode(workspace: WorkspaceView, inputText: string): void {
    const terminalHeight = this.terminal.getRows();
    const width = this.terminal.getColumns();
    const projectViews = workspace.getAllProjectViews();

    this.terminal.clearScreen();

    // Render all projects without cursor during input mode
    for (let i = 0; i < projectViews.length; i++) {
      // Add blank line between projects (not before first)
      if (i > 0) {
        this.terminal.writeLine('');
      }

      const view = projectViews[i];
      const tasks = view.getTasks();
      const stats = getTaskStats(tasks);

      this.terminal.writeLine(
        formatHeader(view.getTitle(), stats.total, stats.completed)
      );

      tasks.forEach((task) => {
        this.terminal.writeLine(formatTask(task, false));
      });
    }

    this.terminal.writeLine(formatInputSeparator(width));
    this.terminal.writeLine(formatInputRow(inputText, 'Type a task...'));

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
