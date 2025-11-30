import { Renderer } from '@plannet/ui';
import { Task, TaskRepository, getTaskStats } from '@plannet/tasks';
import { TaskListView } from '@plannet/ui';
import { KeypressHandler, Keybind } from '@plannet/io';
import { KEYBINDS } from '@plannet/ui';

interface Command {
  execute(): void | Promise<void>;
  shouldRerender: boolean;
  name: string;
}

export class InteractiveTaskViewer {
  private readonly viewModel: TaskListView;
  private readonly keypressHandler: KeypressHandler;
  private resolveExit!: () => void;
  private readonly exitPromise: Promise<void>;

  constructor(
    private readonly renderer: Renderer,
    private readonly taskRepo: TaskRepository,
    tasks: Task[]
  ) {
    this.viewModel = new TaskListView(tasks);
    this.keypressHandler = new KeypressHandler(KEYBINDS);

    this.exitPromise = new Promise((resolve) => {
      this.resolveExit = resolve;
    });
  }

  async run(): Promise<void> {
    this.renderer.enterAlternateScreen();
    this.render();
    this.setupKeypress();

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
      // WIP: This is broken because of conflicted ownership of stdin. REFACTOR_INPUT_MANAGEMENT.md will fix this.
      // [
      //   KEYBINDS.ADD,
      //   {
      //     name: 'add',
      //     shouldRerender: false,
      //     execute: () => this.handleAdd(),
      //   },
      // ],
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

  private setupKeypress(): void {
    const commands = this.createCommandRegistry();

    this.keypressHandler.start(async (keybind) => {
      const command = commands.get(keybind);
      if (command) {
        await this.executeCommand(command);
      }
    });
  }

  private async handleQuit(): Promise<void> {
    try {
      await this.taskRepo.save(this.viewModel.getTasksForSave());
    } catch (error) {
      console.error('Error saving tasks:', error);
    } finally {
      this.keypressHandler.stop();
      this.renderer.exitAlternateScreen();
      this.resolveExit();
    }
  }

  private async handleAdd(): Promise<void> {
    this.keypressHandler.stop();

    try {
      const input = await this.renderer.promptForText('Add new task:');
      if (input) {
        this.viewModel.addTask(new Task(input));
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      this.render();
      this.setupKeypress();
    }
  }
}
