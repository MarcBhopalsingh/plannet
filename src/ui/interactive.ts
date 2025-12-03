import { Renderer, ProjectView, KEYBINDS } from '@plannet/ui';
import { Task, Project, ProjectRepository, getTaskStats } from '@plannet/tasks';
import { InputManager, TextPrompt, Keybind } from '@plannet/io';

interface Command {
  name: string;
  execute(): void | Promise<void>;
  shouldRerender: boolean;
}

export class InteractiveTaskViewer {
  private readonly viewModel: ProjectView;
  private readonly inputManager: InputManager;
  private readonly textPrompt: TextPrompt;
  private readonly commands: Map<Keybind, Command>;
  private onExit: (() => void) | null = null;

  constructor(
    private readonly renderer: Renderer,
    private readonly projectRepo: ProjectRepository,
    private readonly project: Project,
    private readonly projectPath: string
  ) {
    this.viewModel = new ProjectView(project);
    this.inputManager = new InputManager();
    this.textPrompt = new TextPrompt(this.inputManager);
    this.commands = this.buildCommands();
  }

  async run(): Promise<void> {
    this.renderer.enterAlternateScreen();
    this.render();
    this.inputManager.start();
    this.enterNavigationMode();

    await new Promise<void>((resolve) => {
      this.onExit = resolve;
    });

    await this.shutdown();
  }

  private async shutdown(): Promise<void> {
    try {
      await this.projectRepo.save(this.projectPath, this.project);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      this.inputManager.stop();
      this.renderer.exitAlternateScreen();
    }
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
    this.inputManager.setHandler(async (_, key) => {
      const keybind = Object.values(KEYBINDS).find((b) => b.match(key));
      const command = keybind && this.commands.get(keybind);
      if (command) await this.executeCommand(command);
    });
  }

  private async executeCommand(command: Command): Promise<void> {
    try {
      await command.execute();
    } catch (error) {
      console.error(`Command '${command.name}' failed:`, error);
    }
    if (command.shouldRerender) this.render();
  }

  private buildCommands(): Map<Keybind, Command> {
    return new Map([
      [
        KEYBINDS.QUIT,
        { name: 'quit', shouldRerender: false, execute: () => this.onExit?.() },
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
        { name: 'add', shouldRerender: false, execute: () => this.handleAdd() },
      ],
      [
        KEYBINDS.EDIT,
        {
          name: 'edit',
          shouldRerender: false,
          execute: () => this.handleEdit(),
        },
      ],
      [
        KEYBINDS.DELETE,
        {
          name: 'delete',
          shouldRerender: true,
          execute: () => this.viewModel.deleteSelectedTask(),
        },
      ],
      [
        KEYBINDS.SORT,
        {
          name: 'sort',
          shouldRerender: true,
          execute: () => this.viewModel.sortByCompletion(),
        },
      ],
    ]);
  }

  private async handleAdd(): Promise<void> {
    const input = await this.promptForInput();
    this.enterNavigationMode();
    if (input) this.viewModel.addTask(new Task(input));
    this.render();
  }

  private async handleEdit(): Promise<void> {
    const task = this.viewModel.getSelectedTask();
    if (!task) return;
    const input = await this.promptForInput(task.description);
    this.enterNavigationMode();
    if (input) this.viewModel.updateSelectedTask(input);
    this.render();
  }

  private promptForInput(initialValue = ''): Promise<string | null> {
    return this.textPrompt.prompt({
      initialValue,
      onUpdate: (input) => {
        const stats = getTaskStats(this.viewModel.getTasks());
        this.renderer.renderInputMode(this.viewModel.getTasks(), stats, input);
      },
    });
  }
}
