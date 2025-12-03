import { Terminal } from '@plannet/io';
import { Task, TaskStats } from '@plannet/tasks';
import { KEYBINDS } from '@plannet/ui';

const ANSI = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  STRIKETHROUGH: '\x1b[9m',
  GRAY: '\x1b[90m',
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_CYAN: '\x1b[96m',
} as const;

const ICONS = {
  CHECKBOX_COMPLETED: '◉',
  CHECKBOX_INCOMPLETE: '◯',
  CURSOR: '▸',
  DOT: '•',
  PROGRESS_EMPTY: '○',
  PROGRESS_PARTIAL: '◐',
  PROGRESS_FULL: '●',
} as const;

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

  render(tasks: Task[], selectedIndex: number, stats: TaskStats): void {
    const terminalHeight = this.terminal.getRows();

    this.terminal.clearScreen();

    if (tasks.length === 0) {
      this.getEmptyStateLines().forEach((line) =>
        this.terminal.writeLine(line)
      );
      this.renderFooter(terminalHeight, false);
      return;
    }

    // Stats line
    this.terminal.writeLine(this.getStatsLine(stats.total, stats.completed));

    // Calculate how many tasks fit
    const maxVisibleTasks = terminalHeight - 5;
    const visibleTasks = this.getVisibleTasksWindow(
      tasks,
      selectedIndex,
      maxVisibleTasks
    );

    // Task lines
    visibleTasks.forEach((task, index) => {
      this.terminal.writeLine(
        this.formatTaskText(task, index === selectedIndex)
      );
    });

    this.renderFooter(terminalHeight, false);
  }

  renderInputMode(tasks: Task[], stats: TaskStats, inputText: string): void {
    const terminalHeight = this.terminal.getRows();

    this.terminal.clearScreen();

    if (tasks.length === 0) {
      // Just show stats placeholder
      this.terminal.writeLine(this.getStatsLine(0, 0));
    } else {
      // Stats line
      this.terminal.writeLine(this.getStatsLine(stats.total, stats.completed));

      // Calculate how many tasks fit (leave room for separator + input + footer)
      const maxVisibleTasks = terminalHeight - 7;
      const visibleTasks = this.getVisibleTasksWindow(
        tasks,
        tasks.length - 1,
        maxVisibleTasks
      );

      // Task lines (no selection cursor in input mode)
      visibleTasks.forEach((task) => {
        this.terminal.writeLine(this.formatTaskText(task, false));
      });
    }

    // Separator line
    const width = this.terminal.getColumns();
    this.terminal.writeLine(
      `  ${ANSI.GRAY}${'─'.repeat(Math.min(40, width - 4))}${ANSI.RESET}`
    );

    // Input row
    const inputDisplay = inputText
      ? `${inputText}▎`
      : `${ANSI.DIM}Type a task...${ANSI.RESET}`;
    this.terminal.writeLine(
      `  ${ANSI.BRIGHT_CYAN}›${ANSI.RESET} ${inputDisplay}`
    );

    this.renderFooter(terminalHeight, true);
  }

  private getEmptyStateLines(): string[] {
    return [
      '',
      `  ${ANSI.GRAY}${ICONS.DOT} No tasks yet. Press ${ANSI.BRIGHT_CYAN}a${ANSI.GRAY} to add one!${ANSI.RESET}`,
      '',
    ];
  }

  private getStatsLine(total: number, completed: number): string {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressIcon = this.getProgressIcon(percentage);
    const percentColor =
      percentage === 100
        ? ANSI.BRIGHT_GREEN
        : percentage >= 50
        ? ANSI.BRIGHT_CYAN
        : ANSI.GRAY;

    return `  ${ANSI.GRAY}${progressIcon} ${ANSI.RESET}${total} task${
      total !== 1 ? 's' : ''
    } ${ANSI.GRAY}${ICONS.DOT}${ANSI.RESET} ${ANSI.BRIGHT_GREEN}${completed}${
      ANSI.RESET
    } completed ${ANSI.GRAY}${ICONS.DOT}${
      ANSI.RESET
    } ${percentColor}${percentage}%${ANSI.RESET}\n`;
  }

  private getProgressIcon(percentage: number): string {
    if (percentage === 0) return ANSI.GRAY + ICONS.PROGRESS_EMPTY + ANSI.RESET;
    if (percentage === 100)
      return ANSI.BRIGHT_GREEN + ICONS.PROGRESS_FULL + ANSI.RESET;
    return ANSI.BRIGHT_CYAN + ICONS.PROGRESS_PARTIAL + ANSI.RESET;
  }

  private renderHelpText(inputMode: boolean): string {
    if (inputMode) {
      return `  ${ANSI.BRIGHT_CYAN}Enter${ANSI.GRAY}:${ANSI.RESET} save  ${ANSI.GRAY}${ICONS.DOT}${ANSI.RESET}  ${ANSI.BRIGHT_CYAN}Esc${ANSI.GRAY}:${ANSI.RESET} cancel`;
    }

    const helpItems = Object.values(KEYBINDS).map((kb) => {
      const [key, ...actionParts] = kb.description.split(':');
      const action = actionParts.join(':').trim();
      return `${ANSI.BRIGHT_CYAN}${key}${ANSI.GRAY}:${ANSI.RESET} ${action}`;
    });

    const separator = `  ${ANSI.GRAY}${ICONS.DOT}${ANSI.RESET}  `;
    return `  ${helpItems.join(separator)}`;
  }

  private getVisibleTasksWindow(
    tasks: Task[],
    selectedIndex: number,
    maxVisible: number
  ): Task[] {
    if (tasks.length <= maxVisible) {
      return tasks; // All fit
    }

    // Calculate scroll window centered on selection
    let start = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
    const end = Math.min(tasks.length, start + maxVisible);

    // Adjust if we're at the end
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    return tasks.slice(start, end);
  }

  private renderFooter(terminalHeight: number, inputMode: boolean): void {
    const width = this.terminal.getColumns();
    const separator = this.createSeparatorLine(width);

    // Position cursor at bottom
    this.terminal.moveCursor(terminalHeight - 1, 0);
    this.terminal.writeLine(separator);
    this.terminal.write(this.renderHelpText(inputMode));
  }

  private createSeparatorLine(width: number): string {
    const line = '─'.repeat(Math.max(0, width - 2));
    return `${ANSI.GRAY}╭${line}╮${ANSI.RESET}`;
  }

  private formatTaskText(task: Task, isSelected: boolean): string {
    // Checkbox styling
    const checkbox = task.completed
      ? `${ANSI.BRIGHT_GREEN}${ICONS.CHECKBOX_COMPLETED}${ANSI.RESET}`
      : `${ANSI.BRIGHT_CYAN}${ICONS.CHECKBOX_INCOMPLETE}${ANSI.RESET}`;

    // Cursor/selection indicator
    const cursor = isSelected
      ? `${ANSI.BRIGHT_CYAN}${ICONS.CURSOR}${ANSI.RESET}`
      : ' ';

    // Description styling
    let description = task.description;
    if (task.completed) {
      description = `${ANSI.GRAY}${ANSI.STRIKETHROUGH}${description}${ANSI.RESET}`;
    } else if (isSelected) {
      description = `${ANSI.BOLD}${description}${ANSI.RESET}`;
    }

    // Add subtle spacing
    const spacing = isSelected ? '' : ' ';

    return `  ${cursor} ${checkbox} ${spacing}${description}`;
  }
}
