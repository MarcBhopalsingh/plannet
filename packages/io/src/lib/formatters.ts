import { ANSI } from './ansi';

/**
 * Generic TUI formatting utilities
 */

export type StatusType = 'success' | 'info' | 'warning';

const STATUS_ICONS: Record<StatusType, string> = {
  success: '✓',
  info: '›',
  warning: '!',
};

const STATUS_COLORS: Record<StatusType, string> = {
  success: ANSI.BRIGHT_GREEN,
  info: ANSI.BLUE,
  warning: ANSI.YELLOW,
};

/**
 * Format a status/toast message with icon and color
 */
export function formatStatusMessage(
  message: string,
  type: StatusType = 'info'
): string {
  const icon = STATUS_ICONS[type];
  const color = STATUS_COLORS[type];
  return `  ${color}${icon}${ANSI.RESET} ${message}`;
}

/**
 * Format a horizontal separator line
 */
export function formatSeparator(width: number): string {
  const line = '─'.repeat(Math.max(0, width));
  return `${ANSI.GRAY}${line}${ANSI.RESET}`;
}

/**
 * Format an indented separator line (for input areas)
 */
export function formatInputSeparator(width: number): string {
  return `  ${ANSI.GRAY}${'─'.repeat(Math.max(0, width - 4))}${ANSI.RESET}`;
}

/**
 * Format a text input row with cursor
 */
export function formatInputRow(
  inputText: string,
  placeholder = 'Type here...'
): string {
  const inputDisplay = inputText
    ? `${inputText}▎`
    : `${ANSI.DIM}${placeholder}${ANSI.RESET}`;
  return `  ${ANSI.GRAY}›${ANSI.RESET} ${inputDisplay}`;
}

/**
 * Progress indicator icons
 */
export const PROGRESS_ICONS = {
  EMPTY: '○',
  PARTIAL: '◐',
  FULL: '●',
} as const;

/**
 * Format a progress icon based on percentage (0-100)
 */
export function formatProgressIcon(percentage: number): string {
  if (percentage === 0) return ANSI.GRAY + PROGRESS_ICONS.EMPTY + ANSI.RESET;
  if (percentage === 100)
    return ANSI.BRIGHT_GREEN + PROGRESS_ICONS.FULL + ANSI.RESET;
  return PROGRESS_ICONS.PARTIAL;
}
