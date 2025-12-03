import { ProjectRepository } from '@plannet/tasks';
import { Terminal } from '@plannet/io';

const DEFAULT_PROJECT = 'inbox';

export async function handleList(): Promise<void> {
  const projectRepo = new ProjectRepository();
  const project = await projectRepo.load(DEFAULT_PROJECT);

  const terminal = new Terminal();
  project.tasks.forEach((task) => {
    const prefix = task.completed ? '[x]' : '[ ]';
    terminal.writeLine(`${prefix} ${task.description}`);
  });
}
