import * as readline from 'readline';
import { onKeypress } from '../input.js';
import { Terminal } from './terminal.js';
import { Renderer } from './renderer.js';
import { Task } from '../types.js';

export class InteractiveTaskViewer {
  private selectedIndex = 0;
  private cleanupFn: (() => void) | null = null;

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
    this.cleanupFn = onKeypress((str: string, key: readline.Key) => {
      if (key.name === 'q') {
        this.terminal.restoreMainScreen();
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
    });
  }

  private cleanup(): void {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
  }
}

