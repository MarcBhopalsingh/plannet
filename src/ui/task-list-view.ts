import { Task } from '@plannet/tasks';

export class TaskListView {
  private selectedIndex = 0;
  private tasks: Task[];

  constructor(tasks: Task[]) {
    this.tasks = tasks;
  }

  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  moveUp(): void {
    if (this.tasks.length > 0) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    }
  }

  moveDown(): void {
    if (this.tasks.length > 0) {
      this.selectedIndex = Math.min(
        this.tasks.length - 1,
        this.selectedIndex + 1
      );
    }
  }

  toggleSelectedTask(): void {
    if (this.tasks.length > 0) {
      this.tasks[this.selectedIndex].toggleCompletion();
    }
  }

  getTasksForSave(): Task[] {
    return [...this.tasks];
  }

  addTask(task: Task): void {
    this.tasks.push(task);
  }

  getSelectedTask(): Task | null {
    return this.tasks[this.selectedIndex] ?? null;
  }

  updateSelectedTask(description: string): void {
    if (this.tasks.length > 0) {
      this.tasks[this.selectedIndex].updateDescription(description);
    }
  }

  deleteSelectedTask(): void {
    if (this.tasks.length > 0) {
      this.tasks.splice(this.selectedIndex, 1);
      // Adjust selection if we deleted the last item
      if (this.selectedIndex >= this.tasks.length && this.tasks.length > 0) {
        this.selectedIndex = this.tasks.length - 1;
      }
    }
  }

  sortByCompletion(): void {
    this.tasks.sort((a, b) => Number(a.completed) - Number(b.completed));
    this.selectedIndex = 0;
  }
}
