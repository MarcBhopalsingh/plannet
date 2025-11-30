import { Task } from '@plannet/types';

export class TaskListView {
  private selectedIndex = 0;
  private readonly tasks: Task[];

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
      this.selectedIndex = Math.min(this.tasks.length - 1, this.selectedIndex + 1);
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
}

