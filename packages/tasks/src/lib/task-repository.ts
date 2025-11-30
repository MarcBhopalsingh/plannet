import { readFile, writeFile } from 'fs/promises';
import { Task } from './task';

export class TaskRepository {
  constructor(private readonly tasksFile: string = 'tasks.json') {}

  private isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
    return (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    );
  }

  async findAll(): Promise<Task[]> {
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
      return [];
    }
  }

  async save(tasks: Task[]): Promise<void> {
    const content = JSON.stringify(tasks, null, 2);
    await writeFile(this.tasksFile, content, 'utf-8');
  }

  async add(task: Task): Promise<void> {
    const tasks = await this.findAll();
    tasks.push(task);
    await this.save(tasks);
  }
}
