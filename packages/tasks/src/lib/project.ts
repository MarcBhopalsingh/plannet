import { Task } from './task';

export class Project {
  constructor(
    public title: string,
    private _tasks: Task[] = []
  ) {}

  get tasks(): ReadonlyArray<Task> {
    return this._tasks;
  }

  addTask(task: Task): void {
    this._tasks.push(task);
  }

  removeTask(index: number): void {
    if (index >= 0 && index < this._tasks.length) {
      this._tasks.splice(index, 1);
    }
  }

  toggleTask(index: number): void {
    if (index >= 0 && index < this._tasks.length) {
      this._tasks[index].toggleCompletion();
    }
  }

  updateTask(index: number, description: string): void {
    this._tasks[index]?.updateDescription(description);
  }

  sortByCompletion(): void {
    this._tasks.sort((a, b) => Number(a.completed) - Number(b.completed));
  }
}

