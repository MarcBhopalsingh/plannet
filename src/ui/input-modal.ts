import { Terminal } from '@plannet/io';

const MODAL_STYLE = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  CURSOR: '█',
} as const;

export class InputModal {
  constructor(private terminal: Terminal) {}

  render(prompt: string, input: string): void {
    this.terminal.clearScreen();
    this.terminal.writeLine(
      `\n  ${MODAL_STYLE.BOLD}${prompt}${MODAL_STYLE.RESET} ${input}${MODAL_STYLE.CURSOR}`
    );
    this.terminal.writeLine(
      `\n  ${MODAL_STYLE.DIM}Enter: save  •  Esc/^C: cancel${MODAL_STYLE.RESET}\n`
    );
  }
}
