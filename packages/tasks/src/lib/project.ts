import { Task } from './task';

export class Project {
  constructor(
    public title: string,
    public tasks: Task[] = []
  ) {}

  addTask(task: Task): void {
    this.tasks.push(task);
  }

  removeTask(index: number): void {
    if (index >= 0 && index < this.tasks.length) {
      this.tasks.splice(index, 1);
    }
  }

  toggleTask(index: number): void {
    if (index >= 0 && index < this.tasks.length) {
      this.tasks[index].toggleCompletion();
    }
  }
}

