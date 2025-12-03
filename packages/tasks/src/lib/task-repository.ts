import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { Task } from './task';

export class TaskRepository {
  private readonly filePath: string;
  private readonly projectDir: string;

  constructor(
    private readonly project: string = 'inbox',
    private readonly baseDir: string = '.plannet'
  ) {
    this.projectDir = join(baseDir, project);
    this.filePath = join(this.projectDir, 'tasks.json');
  }

  private isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
    return (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    );
  }

  async findAll(): Promise<Task[]> {
    try {
      const content = await readFile(this.filePath, 'utf-8');
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
    await mkdir(this.projectDir, { recursive: true });
    const content = JSON.stringify(tasks, null, 2);
    await writeFile(this.filePath, content, 'utf-8');
  }

  async add(task: Task): Promise<void> {
    const tasks = await this.findAll();
    tasks.push(task);
    await this.save(tasks);
  }
}
