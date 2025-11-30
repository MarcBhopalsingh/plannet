import * as readline from 'readline';
import { Renderer } from '@ui/renderer';
import { Task } from '@types';
import { TaskService } from '@services';
import { TaskListView } from '@ui/task-list-view';

export class InteractiveTaskViewer {
  private keypressHandler: ((str: string, key: readline.Key) => void) | null =
    null;
  private readonly viewModel: TaskListView;

  constructor(
    private readonly renderer: Renderer,
    private readonly taskService: TaskService,
    tasks: Task[]
  ) {
    this.viewModel = new TaskListView(tasks);
  }

  async run(): Promise<void> {
    this.renderer.enterAlternateScreen();
    this.render();

    return new Promise((resolve) => {
      this.setupKeypress(resolve);
    });
  }

  private render(): void {
    const stats = this.taskService.getTaskStats(this.viewModel.getTasks());
    this.renderer.render(
      this.viewModel.getTasks(),
      this.viewModel.getSelectedIndex(),
      stats
    );
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
        this.handleQuit(resolve).catch((error) => {
          console.error('Error saving tasks:', error);
          this.cleanup();
          this.renderer.exitAlternateScreen();
          resolve();
        });
      } else if (
        key.name === 'up' ||
        (key.name === 'k' && key.ctrl === false)
      ) {
        this.viewModel.moveUp();
        this.render();
      } else if (
        key.name === 'down' ||
        (key.name === 'j' && key.ctrl === false)
      ) {
        this.viewModel.moveDown();
        this.render();
      } else if (key.name === 'space') {
        this.viewModel.toggleSelectedTask();
        this.render();
      }
    };

    process.stdin.on('keypress', this.keypressHandler);
  }

  private async handleQuit(resolve: () => void): Promise<void> {
    try {
      await this.taskService.saveTasks(this.viewModel.getTasksForSave());
    } catch (error) {
      console.error('Error saving tasks:', error);
    } finally {
      this.cleanup();
      this.renderer.exitAlternateScreen();
      resolve();
    }
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
