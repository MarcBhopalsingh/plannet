import {
  ANSI,
  PROGRESS_ICONS,
  formatInputRow,
  formatInputSeparator,
  formatProgressIcon,
  formatSeparator,
  formatStatusMessage,
} from '@plannet/io';
import { Task } from '@plannet/tasks';
import { KEYBINDS } from './keybinds';

// Re-export generic formatters for convenience
export { formatInputRow, formatInputSeparator, formatProgressIcon, formatSeparator, formatStatusMessage };
export type { StatusType } from '@plannet/io';

/**
 * App-specific icons for task UI
 */
export const ICONS = {
  CHECKBOX_COMPLETED: '◉',
  CHECKBOX_INCOMPLETE: '◯',
  CURSOR: '→',
  DOT: '•',
  EXPANDED: '▼',
  COLLAPSED: '▶',
  // Include progress icons for backwards compatibility
  ...PROGRESS_ICONS,
} as const;

export function formatHeader(
  title: string,
  total: number,
  completed: number,
  isActive = true,
  isCollapsed = false
): string {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const countColor = percentage === 100 ? ANSI.BRIGHT_GREEN : ANSI.RESET;
  const stats = `${countColor}${completed}/${total}${ANSI.RESET} tasks`;

  // Expand/collapse indicator
  const collapseIcon = isCollapsed ? ICONS.COLLAPSED : ICONS.EXPANDED;

  // Active: blue bar + bold title | Inactive: gray bar + dim title
  const bar = isActive ? `${ANSI.BLUE}▌${ANSI.RESET}` : `${ANSI.GRAY}▌${ANSI.RESET}`;
  const titleStyle = isActive ? `${ANSI.BOLD} ${title}${ANSI.RESET}` : `${ANSI.DIM} ${title}${ANSI.RESET}`;
  const iconStyle = `${ANSI.GRAY}${collapseIcon}${ANSI.RESET}`;

  return `  ${bar}${titleStyle} ${iconStyle}  ${stats}\n`;
}

export function formatTask(task: Task, isSelected: boolean): string {
  // Checkbox styling - green for complete, default for incomplete
  const checkbox = task.completed
    ? `${ANSI.BRIGHT_GREEN}${ICONS.CHECKBOX_COMPLETED}${ANSI.RESET}`
    : ICONS.CHECKBOX_INCOMPLETE;

  // Cursor/selection indicator
  const cursor = isSelected ? ` ${ICONS.CURSOR} ` : '   ';

  // Description styling - bold when selected, dim+strike when completed
  let description = task.description;
  if (task.completed) {
    description = `${ANSI.DIM}${ANSI.STRIKETHROUGH}${description}${ANSI.RESET}`;
  } else if (isSelected) {
    description = `${ANSI.BOLD}${description}${ANSI.RESET}`;
  }

  return `  ${cursor} ${checkbox} ${description}`;
}

export function formatEmptyState(): string[] {
  return [
    `      ${ANSI.GRAY}No tasks yet. Press ${ANSI.RESET}${ANSI.BOLD}a${ANSI.RESET}${ANSI.GRAY} to add one!${ANSI.RESET}`,
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
    [KEYBINDS.ADD_PROJECT, KEYBINDS.NEXT_PROJECT, KEYBINDS.TOGGLE_FOLD, KEYBINDS.TOGGLE_FOLD_ALL], // Project actions
    [KEYBINDS.SORT, KEYBINDS.QUIT], // Misc
  ];

  const formattedGroups = groups.map((group) =>
    group.map((kb) => `${ANSI.BOLD}${kb.key}${ANSI.RESET} ${kb.action}`).join('  ')
  );

  return `  ${formattedGroups.join(`  ${ANSI.GRAY}│${ANSI.RESET}  `)}`;
}
