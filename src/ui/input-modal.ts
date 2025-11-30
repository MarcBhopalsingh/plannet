import { Terminal, TextInput } from '@plannet/io';

const MODAL_STYLE = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  CURSOR: '█',
} as const;

export class InputModal {
  private readonly textInput: TextInput;

  constructor(private terminal: Terminal) {
    this.textInput = new TextInput();
  }

  async show(prompt: string): Promise<string | null> {
    this.terminal.showCursor();

    try {
      return await this.textInput.collect((input) => {
        this.render(prompt, input);
      });
    } finally {
      this.terminal.hideCursor();
    }
  }

  private render(prompt: string, input: string): void {
    this.terminal.clearScreen();
    this.terminal.writeLine(
      `\n  ${MODAL_STYLE.BOLD}${prompt}${MODAL_STYLE.RESET} ${input}${MODAL_STYLE.CURSOR}`
    );
    this.terminal.writeLine(
      `\n  ${MODAL_STYLE.DIM}Enter: save  •  Esc: cancel${MODAL_STYLE.RESET}\n`
    );
  }
}

