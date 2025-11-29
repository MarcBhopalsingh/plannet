import { readFile, appendFile } from 'fs/promises';
import { Task } from '@types';

export class TaskService {
  constructor(private readonly tasksFile: string = 'tasks.txt') {}

  private isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
    return (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    );
  }

  async loadTasks(): Promise<Task[]> {
    try {
      const content = await readFile(this.tasksFile, 'utf-8');
      return content.split('\n').filter((line) => line.trim().length > 0);
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        return [];
      }
      throw error;
    }
  }

  async addTask(taskText: string): Promise<void> {
    await appendFile(this.tasksFile, taskText + '\n');
  }

  async getAllTasks(): Promise<Task[]> {
    return this.loadTasks();
  }
}
