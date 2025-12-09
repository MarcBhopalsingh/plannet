import { Project, Task } from '@plannet/tasks';
import { ProjectView } from './project-view';

export class WorkspaceView {
  private activeProjectIndex = 0;
  private readonly projectViews: ProjectView[] = [];

  constructor(projects: Project[]) {
    for (const project of projects) {
      this.projectViews.push(new ProjectView(project));
    }
  }

  getActiveProjectView(): ProjectView {
    return this.projectViews[this.activeProjectIndex];
  }

  getActiveProjectIndex(): number {
    return this.activeProjectIndex;
  }

  nextProject(): void {
    if (this.projectViews.length > 1) {
      this.activeProjectIndex =
        (this.activeProjectIndex + 1) % this.projectViews.length;
    }
  }

  getAllProjectViews(): ProjectView[] {
    return this.projectViews;
  }

  getProjectCount(): number {
    return this.projectViews.length;
  }

  addProject(project: Project): void {
    this.projectViews.push(new ProjectView(project));
  }

  moveSelectedTaskToNextProject(): boolean {
    if (this.projectViews.length < 2) return false;

    const currentView = this.getActiveProjectView();
    const task = currentView.getSelectedTask();
    if (!task) return false;

    // Remove from current project
    currentView.deleteSelectedTask();

    // Add to next project (with wrap)
    const nextIndex = (this.activeProjectIndex + 1) % this.projectViews.length;
    this.projectViews[nextIndex].addTask(
      new Task(task.description, task.completed)
    );

    return true;
  }

  // Delegate common operations to active project view
  moveUp(): void {
    this.getActiveProjectView().moveUp();
  }

  moveDown(): void {
    this.getActiveProjectView().moveDown();
  }

  toggleSelectedTask(): void {
    this.getActiveProjectView().toggleSelectedTask();
  }

  deleteSelectedTask(): void {
    this.getActiveProjectView().deleteSelectedTask();
  }

  sortByCompletion(): void {
    this.getActiveProjectView().sortByCompletion();
  }

  addTask(task: Task): void {
    this.getActiveProjectView().addTask(task);
  }

  getSelectedTask(): Task | null {
    return this.getActiveProjectView().getSelectedTask();
  }

  updateSelectedTask(description: string): void {
    this.getActiveProjectView().updateSelectedTask(description);
  }

  toggleFoldActiveProject(): void {
    const view = this.getActiveProjectView();
    if (view.isCollapsed()) {
      view.expand();
    } else {
      view.collapse();
    }
  }

  toggleFoldAll(): void {
    // Smart toggle: if any expanded, fold all; if all folded, unfold all
    const anyExpanded = this.projectViews.some((view) => !view.isCollapsed());
    for (const view of this.projectViews) {
      if (anyExpanded) {
        view.collapse();
      } else {
        view.expand();
      }
    }
  }
}
