import { ANSI } from '@plannet/io';
import { Task } from '@plannet/tasks';
import { KEYBINDS } from './keybinds';

export const ICONS = {
  CHECKBOX_COMPLETED: '◉',
  CHECKBOX_INCOMPLETE: '◯',
  CURSOR: '▸',
  DOT: '•',
  PROGRESS_EMPTY: '○',
  PROGRESS_PARTIAL: '◐',
  PROGRESS_FULL: '●',
} as const;

export function formatProgressIcon(percentage: number): string {
  if (percentage === 0) return ANSI.GRAY + ICONS.PROGRESS_EMPTY + ANSI.RESET;
  if (percentage === 100)
    return ANSI.BRIGHT_GREEN + ICONS.PROGRESS_FULL + ANSI.RESET;
  return ANSI.BRIGHT_CYAN + ICONS.PROGRESS_PARTIAL + ANSI.RESET;
}

export function formatStats(total: number, completed: number): string {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressIcon = formatProgressIcon(percentage);
  const percentColor = percentage === 100 ? ANSI.BRIGHT_GREEN : ANSI.GRAY;

  return `  ${ANSI.GRAY}${progressIcon} ${ANSI.RESET}${total} task${
    total !== 1 ? 's' : ''
  } ${ANSI.GRAY}${ICONS.DOT}${ANSI.RESET} ${ANSI.BRIGHT_GREEN}${completed}${
    ANSI.RESET
  } completed ${ANSI.GRAY}${ICONS.DOT}${
    ANSI.RESET
  } ${percentColor}${percentage}%${ANSI.RESET}\n`;
}

export function formatTask(task: Task, isSelected: boolean): string {
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

export function formatEmptyState(): string[] {
  return [
    '',
    `  ${ANSI.GRAY}${ICONS.DOT} No tasks yet. Press ${ANSI.BRIGHT_CYAN}a${ANSI.GRAY} to add one!${ANSI.RESET}`,
    '',
  ];
}

export function formatHelpBar(inputMode: boolean): string {
  if (inputMode) {
    return `  ${ANSI.BRIGHT_CYAN}Enter${ANSI.GRAY}:${ANSI.RESET} save  ${ANSI.GRAY}${ICONS.DOT}${ANSI.RESET}  ${ANSI.BRIGHT_CYAN}Esc${ANSI.GRAY}:${ANSI.RESET} cancel`;
  }

  const helpItems = Object.values(KEYBINDS).map(
    (kb) => `${ANSI.BRIGHT_CYAN}${kb.key}${ANSI.RESET} ${kb.action}`
  );

  return `  ${helpItems.join('  ')}`;
}

export function formatSeparator(width: number): string {
  const line = '─'.repeat(Math.max(0, width - 2));
  return `${ANSI.GRAY}╭${line}╮${ANSI.RESET}`;
}

export function formatInputSeparator(width: number): string {
  return `  ${ANSI.GRAY}${'─'.repeat(width - 4)}${ANSI.RESET}`;
}

export function formatInputRow(inputText: string): string {
  const inputDisplay = inputText
    ? `${inputText}▎`
    : `${ANSI.DIM}Type a task...${ANSI.RESET}`;
  return `  ${ANSI.BRIGHT_CYAN}›${ANSI.RESET} ${inputDisplay}`;
}
