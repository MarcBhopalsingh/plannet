export const ANSI = {
  // Text Reset
  RESET: '\x1b[0m',

  // Text Styles
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  STRIKETHROUGH: '\x1b[9m',

  // Colors
  GRAY: '\x1b[90m',
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_CYAN: '\x1b[96m',

  // Screen Control
  ALTERNATE_SCREEN_ON: '\x1b[?1049h',
  ALTERNATE_SCREEN_OFF: '\x1b[?1049l',
  CLEAR_SCREEN: '\x1b[2J\x1b[H',

  // Cursor
  HIDE_CURSOR: '\x1b[?25l',
  SHOW_CURSOR: '\x1b[?25h',
} as const;

