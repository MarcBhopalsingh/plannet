import * as readline from 'readline';
import { KeyEvent } from './types.js';

export function setupKeypress(): void {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
}

export function cleanup(): void {
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
}

export function onKeypress(
  handler: (str: string, key: KeyEvent) => void
): () => void {
  setupKeypress();
  process.stdin.on('keypress', handler);
  return () => {
    cleanup();
    process.stdin.removeListener('keypress', handler);
  };
}
