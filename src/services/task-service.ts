import { readFile, writeFile } from 'fs/promises';
import { Task } from '@plannet/types';

export class TaskService {
  constructor(private readonly tasksFile: string = 'tasks.json') {}

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
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map(
        (item) => new Task(item.description, item.completed ?? false)
      );
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        return [];
      }
      // If JSON is invalid, return empty array
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    const content = JSON.stringify(tasks, null, 2);
    await writeFile(this.tasksFile, content, 'utf-8');
  }

  async addTask(taskText: string): Promise<void> {
    const tasks = await this.loadTasks();
    tasks.push(new Task(taskText, false));
    await this.saveTasks(tasks);
  }

  getTaskStats(tasks: Task[]): { total: number; completed: number } {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
    };
  }
}
