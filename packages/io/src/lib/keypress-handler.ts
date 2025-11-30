import * as readline from 'readline';
import { Keybind } from './keybinds';

export class KeypressHandler {
  private keypressListener?: (str: string, key: readline.Key) => void;

  constructor(private readonly keybinds: Record<string, Keybind>) {}

  start(onKeybind: (keybind: Keybind) => void | Promise<void>): void {
    readline.emitKeypressEvents(process.stdin);

    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }

    this.keypressListener = async (str: string, key: readline.Key) => {
      const keybind = Object.values(this.keybinds).find((bind) =>
        bind.match(key)
      );

      if (keybind) {
        await onKeybind(keybind);
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
}
