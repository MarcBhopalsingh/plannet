import { Task } from './task';

export interface TaskStats {
  total: number;
  completed: number;
}

export function getTaskStats(tasks: Task[]): TaskStats {
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
  };
}
