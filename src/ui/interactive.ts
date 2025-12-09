import { Renderer } from './renderer';
import { Project, ProjectRepository } from '@plannet/tasks';
import { InputManager, TextPrompt } from '@plannet/io';
import { ActionRegistry } from './actions';
import { StatusType } from './formatters';
import { WorkspaceView } from './workspace-view';

export class InteractiveTaskViewer {
  private readonly workspace: WorkspaceView;
  private readonly inputManager: InputManager;
  private readonly textPrompt: TextPrompt;
  private readonly actions: ActionRegistry;
  private exitResolve: (() => void) | null = null;
  private statusTimeout: ReturnType<typeof setTimeout> | null = null;
  private projectPaths: string[] = [];

  constructor(
    private readonly renderer: Renderer,
    private readonly projectRepo: ProjectRepository,
    projects: Array<{ path: string; project: Project }>
  ) {
    this.projectPaths = projects.map((p) => p.path);
    this.workspace = new WorkspaceView(projects.map((p) => p.project));
    this.inputManager = new InputManager();
    this.textPrompt = new TextPrompt(this.inputManager);
    this.actions = new ActionRegistry(
      this.workspace,
      (initial) => this.promptForInput(initial),
      () => this.exitResolve?.(),
      (message, type) => this.showStatus(message, type),
      (name) => this.handleAddProject(name)
    );
  }

  private showStatus(message: string, type: StatusType = 'info'): void {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    this.workspace.getActiveProjectView().setStatus(message, type);
    this.render();

    this.statusTimeout = setTimeout(() => {
      this.workspace.getActiveProjectView().clearStatus();
      this.render();
      this.statusTimeout = null;
    }, 1500);
  }

  private async handleAddProject(name: string): Promise<void> {
    // Create path from name (lowercase, replace spaces with hyphens)
    const path = name.toLowerCase().replace(/\s+/g, '-');
    const project = await this.projectRepo.create(path, name);
    this.workspace.addProject(project);
    this.projectPaths.push(path);
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
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }

    try {
      // Save all projects
      const projectViews = this.workspace.getAllProjectViews();
      for (let i = 0; i < projectViews.length; i++) {
        const project = projectViews[i].getProject();
        const path = this.projectPaths[i];
        await this.projectRepo.save(path, project);
      }
    } catch (error) {
      console.error('Error saving projects:', error);
    } finally {
      this.inputManager.stop();
      this.renderer.exitAlternateScreen();
    }
  }

  private render(): void {
    this.renderer.render(this.workspace);
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
        this.renderer.renderInputMode(this.workspace, input);
      },
    });
    this.setupInputHandler();
    return result;
  }
}
