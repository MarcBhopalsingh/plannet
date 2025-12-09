import { Renderer } from '@plannet/ui';
import { InteractiveTaskViewer } from '@plannet/ui';
import { ProjectRepository } from '@plannet/tasks';

const DEFAULT_PROJECT = 'inbox';

export async function handleInteractive(): Promise<void> {
  const projectRepo = new ProjectRepository();

  // Load all existing projects
  let projectPaths = await projectRepo.listProjects();

  // Ensure inbox exists as default
  if (!projectPaths.includes(DEFAULT_PROJECT)) {
    await projectRepo.create(DEFAULT_PROJECT, 'Inbox');
    projectPaths = [DEFAULT_PROJECT, ...projectPaths];
  }

  // Load all projects
  const projects = await Promise.all(
    projectPaths.map(async (path) => ({
      path,
      project: await projectRepo.load(path),
    }))
  );

  const renderer = new Renderer();
  const viewer = new InteractiveTaskViewer(renderer, projectRepo, projects);
  await viewer.run();
}
