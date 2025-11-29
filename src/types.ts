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

export type Command =
  | 'interactive'
  | 'i'
  | 'list'
  | 'ls'
  | 'add'
  | 'a'
  | 'default'
  | 'help';

export interface KeyEvent {
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  sequence?: string;
}
