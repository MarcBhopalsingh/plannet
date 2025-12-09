import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { Project } from './project';
import { Task } from './task';

export class ProjectRepository {
  constructor(private readonly baseDir: string = '.plannet') {}

  async listProjects(): Promise<string[]> {
    try {
      const entries = await readdir(this.baseDir, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    } catch {
      return [];
    }
  }

  async create(path: string, title: string): Promise<Project> {
    const project = new Project(title, []);
    await this.save(path, project);
    return project;
  }

  async load(path: string): Promise<Project> {
    const projectDir = join(this.baseDir, path);
    const title = await this.loadTitle(projectDir, path);
    const tasks = await this.loadTasks(projectDir);
    return new Project(title, tasks);
  }

  async save(path: string, project: Project): Promise<void> {
    const projectDir = join(this.baseDir, path);
    await mkdir(projectDir, { recursive: true });
    await this.saveTitle(projectDir, project.title);
    await this.saveTasks(projectDir, project.tasks);
  }

  private async loadTitle(projectDir: string, path: string): Promise<string> {
    try {
      const content = await readFile(join(projectDir, 'project.json'), 'utf-8');
      const data = JSON.parse(content);
      return data.title ?? this.defaultTitle(path);
    } catch {
      return this.defaultTitle(path);
    }
  }

  private async loadTasks(projectDir: string): Promise<Task[]> {
    try {
      const content = await readFile(join(projectDir, 'tasks.json'), 'utf-8');
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map((item) => new Task(item.description, item.completed ?? false));
    } catch {
      return [];
    }
  }

  private async saveTitle(projectDir: string, title: string): Promise<void> {
    const content = JSON.stringify({ title }, null, 2);
    await writeFile(join(projectDir, 'project.json'), content, 'utf-8');
  }

  private async saveTasks(projectDir: string, tasks: ReadonlyArray<Task>): Promise<void> {
    const content = JSON.stringify(tasks, null, 2);
    await writeFile(join(projectDir, 'tasks.json'), content, 'utf-8');
  }

  private defaultTitle(path: string): string {
    return path.charAt(0).toUpperCase() + path.slice(1);
  }
}
