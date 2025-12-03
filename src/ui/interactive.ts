import { Renderer, ProjectView } from '@plannet/ui';
import { Project, ProjectRepository } from '@plannet/tasks';
import { InputManager, TextPrompt } from '@plannet/io';
import { ActionRegistry } from './actions';

export class InteractiveTaskViewer {
  private readonly view: ProjectView;
  private readonly inputManager: InputManager;
  private readonly textPrompt: TextPrompt;
  private readonly actions: ActionRegistry;
  private exitResolve: (() => void) | null = null;

  constructor(
    private readonly renderer: Renderer,
    private readonly projectRepo: ProjectRepository,
    private readonly project: Project,
    private readonly projectPath: string
  ) {
    this.view = new ProjectView(project);
    this.inputManager = new InputManager();
    this.textPrompt = new TextPrompt(this.inputManager);
    this.actions = new ActionRegistry(
      this.view,
      (initial) => this.promptForInput(initial),
      () => this.exitResolve?.()
    );
  }

  async run(): Promise<void> {
    this.renderer.enterAlternateScreen();
    this.render();
    this.inputManager.start();
    this.setupInputHandler();

    await new Promise<void>((resolve) => {
      this.exitResolve = resolve;
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
    this.renderer.render(this.view);
  }

  private setupInputHandler(): void {
    this.inputManager.setHandler(async (_, key) => {
      const shouldRerender = await this.actions.execute(key);
      if (shouldRerender) this.render();
    });
  }

  private async promptForInput(initialValue = ''): Promise<string | null> {
    const result = await this.textPrompt.prompt({
      initialValue,
      onUpdate: (input) => {
        this.renderer.renderInputMode(this.view, input);
      },
    });
    this.setupInputHandler();
    return result;
  }
}
