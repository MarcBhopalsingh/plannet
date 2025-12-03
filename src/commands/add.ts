import { ProjectRepository, Task } from '@plannet/tasks';

const DEFAULT_PROJECT = 'inbox';

export async function handleAdd(taskText: string): Promise<void> {
  const projectRepo = new ProjectRepository();
  const project = await projectRepo.load(DEFAULT_PROJECT);
  project.addTask(new Task(taskText));
  await projectRepo.save(DEFAULT_PROJECT, project);
}
