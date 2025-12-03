import { Renderer } from '@plannet/ui';
import { Task, TaskRepository, getTaskStats } from '@plannet/tasks';
import { TaskListView } from '@plannet/ui';
import { InputManager, InputHandler, Keybind } from '@plannet/io';
import { KEYBINDS } from '@plannet/ui';

interface Command {
  execute(): void | Promise<void>;
  shouldRerender: boolean;
  name: string;
}

export class InteractiveTaskViewer {
  private readonly viewModel: TaskListView;
  private readonly inputManager: InputManager;
  private resolveExit!: () => void;
  private readonly exitPromise: Promise<void>;

  constructor(
    private readonly renderer: Renderer,
    private readonly taskRepo: TaskRepository,
    tasks: Task[]
  ) {
    this.viewModel = new TaskListView(tasks);
    this.inputManager = new InputManager();

    this.exitPromise = new Promise((resolve) => {
      this.resolveExit = resolve;
    });
  }

  async run(): Promise<void> {
    this.renderer.enterAlternateScreen();
    this.render();
    this.inputManager.start();
    this.enterNavigationMode();

    return this.exitPromise;
  }

  private render(): void {
    const stats = getTaskStats(this.viewModel.getTasks());
    this.renderer.render(
      this.viewModel.getTasks(),
      this.viewModel.getSelectedIndex(),
      stats
    );
  }

  private enterNavigationMode(): void {
    this.inputManager.setHandler(this.createNavigationHandler());
  }

  private createNavigationHandler(): InputHandler {
    const commands = this.createCommandRegistry();

    return async (str, key) => {
      const keybind = Object.values(KEYBINDS).find((b) => b.match(key));
      if (keybind) {
        const command = commands.get(keybind);
        if (command) {
          await this.executeCommand(command);
        }
      }
    };
  }

  private createTextInputHandler(
    onUpdate: (input: string) => void,
    onComplete: (result: string | null) => void
  ): InputHandler {
    let input = '';

    return (str, key) => {
      if (key.name === 'return') {
        onComplete(input.trim() || null);
      } else if (key.name === 'escape' || (key.name === 'c' && key.ctrl)) {
        onComplete(null);
      } else if (key.name === 'backspace') {
        input = input.slice(0, -1);
        onUpdate(input);
      } else if (str && !key.ctrl && !key.meta) {
        input += str;
        onUpdate(input);
      }
    };
  }

  private promptForText(prompt: string): Promise<string | null> {
    return new Promise((resolve) => {
      this.renderer.renderInputModal(prompt, '');

      this.inputManager.setHandler(
        this.createTextInputHandler(
          (input) => this.renderer.renderInputModal(prompt, input),
          (result) => {
            this.enterNavigationMode();
            resolve(result);
          }
        )
      );
    });
  }

  private createCommandRegistry(): Map<Keybind, Command> {
    return new Map([
      [
        KEYBINDS.QUIT,
        {
          name: 'quit',
          shouldRerender: false,
          execute: () => this.handleQuit(),
        },
      ],
      [
        KEYBINDS.MOVE_UP,
        {
          name: 'moveUp',
          shouldRerender: true,
          execute: () => this.viewModel.moveUp(),
        },
      ],
      [
        KEYBINDS.MOVE_DOWN,
        {
          name: 'moveDown',
          shouldRerender: true,
          execute: () => this.viewModel.moveDown(),
        },
      ],
      [
        KEYBINDS.TOGGLE,
        {
          name: 'toggle',
          shouldRerender: true,
          execute: () => this.viewModel.toggleSelectedTask(),
        },
      ],
      [
        KEYBINDS.ADD,
        {
          name: 'add',
          shouldRerender: false,
          execute: () => this.handleAdd(),
        },
      ],
    ]);
  }

  private async executeCommand(command: Command): Promise<void> {
    try {
      await command.execute();
      if (command.shouldRerender) {
        this.render();
      }
    } catch (error) {
      console.error(`Error executing command '${command.name}':`, error);
      if (command.shouldRerender) {
        this.render();
      }
    }
  }

  private async handleQuit(): Promise<void> {
    try {
      await this.taskRepo.save(this.viewModel.getTasksForSave());
    } catch (error) {
      console.error('Error saving tasks:', error);
    } finally {
      this.inputManager.stop();
      this.renderer.exitAlternateScreen();
      this.resolveExit();
    }
  }

  private async handleAdd(): Promise<void> {
    const input = await this.promptForText('Add new task:');
    if (input) {
      this.viewModel.addTask(new Task(input));
    }
    this.render();
  }
}
