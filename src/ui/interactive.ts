import * as readline from 'readline';
import { Terminal } from './terminal.js';
import { Renderer } from './renderer.js';
import { Task } from '../types.js';

export class InteractiveTaskViewer {
  private selectedIndex = 0;
  private keypressHandler: ((str: string, key: readline.Key) => void) | null = null;

  constructor(
    private readonly terminal: Terminal,
    private readonly renderer: Renderer,
    private readonly tasks: Task[]
  ) {}

  async run(): Promise<void> {
    this.renderer.render(this.tasks, this.selectedIndex);

    return new Promise((resolve) => {
      this.setupKeypress(resolve);
    });
  }

  private setupKeypress(resolve: () => void): void {
    // Set up raw mode for stdin
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }

    // Set up keypress handler
    this.keypressHandler = (str: string, key: readline.Key) => {
      if (key.name === 'q') {
        this.cleanup();
        resolve();
      } else if (
        key.name === 'up' ||
        (key.name === 'k' && key.ctrl === false)
      ) {
        if (this.tasks.length > 0) {
          this.selectedIndex = Math.max(0, this.selectedIndex - 1);
          this.renderer.render(this.tasks, this.selectedIndex);
        }
      } else if (
        key.name === 'down' ||
        (key.name === 'j' && key.ctrl === false)
      ) {
        if (this.tasks.length > 0) {
          this.selectedIndex = Math.min(
            this.tasks.length - 1,
            this.selectedIndex + 1
          );
          this.renderer.render(this.tasks, this.selectedIndex);
        }
      }
    };

    process.stdin.on('keypress', this.keypressHandler);
  }

  private cleanup(): void {
    if (this.keypressHandler) {
      process.stdin.removeListener('keypress', this.keypressHandler);
      this.keypressHandler = null;
    }
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
  }
}

