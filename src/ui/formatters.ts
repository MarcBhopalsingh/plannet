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
  return ICONS.PROGRESS_PARTIAL;
}

export function formatHeader(
  title: string,
  total: number,
  completed: number
): string {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressIcon = formatProgressIcon(percentage);
  const countColor = percentage === 100 ? ANSI.BRIGHT_GREEN : ANSI.RESET;
  const stats = `${progressIcon} ${countColor}${completed}/${total}${ANSI.RESET} tasks`;

  return `\n  ${ANSI.BRIGHT_CYAN}▌${ANSI.RESET}${ANSI.BOLD} ${title}${ANSI.RESET}  ${ANSI.GRAY}${ICONS.DOT}${ANSI.RESET}  ${stats}\n`;
}

export function formatTask(task: Task, isSelected: boolean): string {
  // Checkbox styling - green for complete, default for incomplete
  const checkbox = task.completed
    ? `${ANSI.BRIGHT_GREEN}${ICONS.CHECKBOX_COMPLETED}${ANSI.RESET}`
    : ICONS.CHECKBOX_INCOMPLETE;

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

  return `  ${cursor} ${checkbox} ${description}`;
}

export function formatEmptyState(): string[] {
  return [
    '',
    `  ${ANSI.GRAY}${ICONS.DOT} No tasks yet. Press ${ANSI.RESET}${ANSI.BOLD}a${ANSI.RESET}${ANSI.GRAY} to add one!${ANSI.RESET}`,
    '',
  ];
}

export function formatHelpBar(inputMode: boolean): string {
  if (inputMode) {
    return `  ${ANSI.BOLD}Enter${ANSI.RESET} save  ${ANSI.GRAY}│${ANSI.RESET}  ${ANSI.BOLD}Esc${ANSI.RESET} cancel`;
  }

  // Group keybinds logically with pipe separators
  const groups = [
    [KEYBINDS.ADD, KEYBINDS.TOGGLE], // Primary actions
    [KEYBINDS.MOVE_UP, KEYBINDS.MOVE_DOWN], // Navigation
    [KEYBINDS.EDIT, KEYBINDS.DELETE], // Edit actions
    [KEYBINDS.SORT, KEYBINDS.QUIT], // Misc
  ];

  const formattedGroups = groups.map((group) =>
    group
      .map((kb) => `${ANSI.BOLD}${kb.key}${ANSI.RESET} ${kb.action}`)
      .join('  ')
  );

  return `  ${formattedGroups.join(`  ${ANSI.GRAY}│${ANSI.RESET}  `)}`;
}

export function formatSeparator(width: number): string {
  const line = '─'.repeat(Math.max(0, width));
  return `${ANSI.GRAY}${line}${ANSI.RESET}`;
}

export function formatInputSeparator(width: number): string {
  return `  ${ANSI.GRAY}${'─'.repeat(width - 4)}${ANSI.RESET}`;
}

export function formatInputRow(inputText: string): string {
  const inputDisplay = inputText
    ? `${inputText}▎`
    : `${ANSI.DIM}Type a task...${ANSI.RESET}`;
  return `  ${ANSI.GRAY}›${ANSI.RESET} ${inputDisplay}`;
}
