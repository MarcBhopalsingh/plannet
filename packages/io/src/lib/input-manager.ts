import * as readline from 'readline';

export type InputHandler = (str: string, key: readline.Key) => void | Promise<void>;

export class InputManager {
  private currentHandler?: InputHandler;
  private keypressListener?: (str: string, key: readline.Key) => void;

  start(): void {
    readline.emitKeypressEvents(process.stdin);

    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }

    this.keypressListener = async (str: string, key: readline.Key) => {
      if (this.currentHandler) {
        await this.currentHandler(str, key);
      }
    };

    process.stdin.on('keypress', this.keypressListener);
  }

  stop(): void {
    if (this.keypressListener) {
      process.stdin.removeListener('keypress', this.keypressListener);
      this.keypressListener = undefined;
    }

    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }

    process.stdin.pause();
  }

  setHandler(handler: InputHandler): void {
    this.currentHandler = handler;
  }
}
