import { Terminal } from '@plannet/io';
import { Task, TaskStats } from '@plannet/tasks';
import { KEYBINDS } from '@plannet/ui';
import { InputModal } from './input-modal';

const ANSI = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  ITALIC: '\x1b[3m',
  STRIKETHROUGH: '\x1b[9m',

  // Colors
  CYAN: '\x1b[36m',
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  YELLOW: '\x1b[33m',
  GRAY: '\x1b[90m',

  // Bright variants
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_CYAN: '\x1b[96m',
  BRIGHT_BLUE: '\x1b[94m',
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
  private readonly inputModal: InputModal;

  constructor() {
    this.terminal = new Terminal();
    this.inputModal = new InputModal(this.terminal);
  }

  enterAlternateScreen(): void {
    this.terminal.setupAlternateScreen();
  }

  exitAlternateScreen(): void {
    this.terminal.restoreMainScreen();
  }

  renderInputModal(prompt: string, input: string): void {
    this.inputModal.render(prompt, input);
  }

  render(tasks: Task[], selectedIndex: number, stats: TaskStats): void {
    const terminalHeight = this.terminal.getRows();
    const FOOTER_LINES = 2; // separator + help text

    this.terminal.clearScreen();

    if (tasks.length === 0) {
      this.renderEmptyState();
      this.renderStickyFooter(terminalHeight);
      return;
    }

    // Stats line (scrolls with content, no sticky header)
    this.renderStatsLine(stats.total, stats.completed);

    // Calculate how many tasks fit
    const maxVisibleTasks = terminalHeight - FOOTER_LINES - 3; // -3 for stats + blank line
    const visibleTasks = this.getVisibleTasksWindow(
      tasks,
      selectedIndex,
      maxVisibleTasks
    );

    this.renderTaskList(visibleTasks, selectedIndex);

    // Always render footer at bottom
    this.renderStickyFooter(terminalHeight);
  }

  private renderEmptyState(): void {
    this.terminal.writeLine('');
    this.terminal.writeLine(
      `  ${ANSI.GRAY}${ICONS.DOT} No tasks yet. Press ${ANSI.BRIGHT_CYAN}a${ANSI.GRAY} to add one!${ANSI.RESET}`
    );
    this.terminal.writeLine('');
  }

  private renderStatsLine(total: number, completed: number): void {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressIcon = this.getProgressIcon(percentage);
    const percentColor =
      percentage === 100
        ? ANSI.BRIGHT_GREEN
        : percentage >= 50
        ? ANSI.BRIGHT_CYAN
        : ANSI.GRAY;

    this.terminal.writeLine(
      `  ${ANSI.GRAY}${progressIcon} ${ANSI.RESET}${total} task${
        total !== 1 ? 's' : ''
      } ${ANSI.GRAY}${ICONS.DOT}${ANSI.RESET} ${ANSI.BRIGHT_GREEN}${completed}${
        ANSI.RESET
      } completed ${ANSI.GRAY}${ICONS.DOT}${
        ANSI.RESET
      } ${percentColor}${percentage}%${ANSI.RESET}\n`
    );
  }

  private getProgressIcon(percentage: number): string {
    if (percentage === 0) return ANSI.GRAY + ICONS.PROGRESS_EMPTY + ANSI.RESET;
    if (percentage === 100)
      return ANSI.BRIGHT_GREEN + ICONS.PROGRESS_FULL + ANSI.RESET;
    return ANSI.BRIGHT_CYAN + ICONS.PROGRESS_PARTIAL + ANSI.RESET;
  }

  private renderTaskList(tasks: Task[], selectedIndex: number): void {
    tasks.forEach((task, index) => {
      const text = this.formatTaskText(task, index === selectedIndex);
      this.terminal.writeLine(text);
    });
  }

  private renderHelpText(): string {
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

  private renderStickyFooter(terminalHeight: number): void {
    const width = this.terminal.getColumns();
    const separator = this.createSeparatorLine(width);

    // Position cursor at bottom
    this.terminal.moveCursor(terminalHeight - 1, 0);
    this.terminal.writeLine(separator);
    this.terminal.write(this.renderHelpText());
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
