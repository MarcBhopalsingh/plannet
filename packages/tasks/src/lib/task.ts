export class Task {
  description: string;
  completed: boolean;

  constructor(description: string, completed: boolean = false) {
    this.description = description;
    this.completed = completed;
  }

  toggleCompletion(): void {
    this.completed = !this.completed;
  }
}
