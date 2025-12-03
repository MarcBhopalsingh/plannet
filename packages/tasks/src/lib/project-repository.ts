import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { ProjectData } from './types';

export class ProjectRepository {
  private readonly filePath: string;
  private readonly projectDir: string;

  constructor(
    private readonly project: string = 'inbox',
    private readonly baseDir: string = '.plannet'
  ) {
    this.projectDir = join(baseDir, project);
    this.filePath = join(this.projectDir, 'project.json');
  }

  async load(): Promise<ProjectData> {
    try {
      const content = await readFile(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { title: this.defaultTitle() };
    }
  }

  async save(meta: ProjectData): Promise<void> {
    await mkdir(this.projectDir, { recursive: true });
    const content = JSON.stringify(meta, null, 2);
    await writeFile(this.filePath, content, 'utf-8');
  }

  private defaultTitle(): string {
    return this.project.charAt(0).toUpperCase() + this.project.slice(1);
  }
}
