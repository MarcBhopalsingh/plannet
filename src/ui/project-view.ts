import { Task, Project } from '@plannet/tasks';

export class ProjectView {
  private selectedIndex = 0;

  constructor(private readonly project: Project) {}

  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  getTasks(): ReadonlyArray<Task> {
    return this.project.tasks;
  }

  moveUp(): void {
    if (this.project.tasks.length > 0) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    }
  }

  moveDown(): void {
    if (this.project.tasks.length > 0) {
      this.selectedIndex = Math.min(
        this.project.tasks.length - 1,
        this.selectedIndex + 1
      );
    }
  }

  toggleSelectedTask(): void {
    this.project.toggleTask(this.selectedIndex);
  }

  addTask(task: Task): void {
    this.project.addTask(task);
  }

  getSelectedTask(): Task | null {
    return this.project.tasks[this.selectedIndex] ?? null;
  }

  updateSelectedTask(description: string): void {
    this.project.updateTask(this.selectedIndex, description);
  }

  deleteSelectedTask(): void {
    this.project.removeTask(this.selectedIndex);
    this.clampSelection();
  }

  sortByCompletion(): void {
    this.project.sortByCompletion();
    this.selectedIndex = 0;
  }

  private clampSelection(): void {
    const len = this.project.tasks.length;
    if (this.selectedIndex >= len && len > 0) {
      this.selectedIndex = len - 1;
    }
  }
}

