import { Renderer } from '@plannet/ui';
import { InteractiveTaskViewer } from '@plannet/ui';
import { ProjectRepository } from '@plannet/tasks';

const DEFAULT_PROJECT = 'inbox';

export async function handleInteractive(): Promise<void> {
  const projectRepo = new ProjectRepository();
  const project = await projectRepo.load(DEFAULT_PROJECT);

  const renderer = new Renderer();
  const viewer = new InteractiveTaskViewer(
    renderer,
    projectRepo,
    project,
    DEFAULT_PROJECT
  );
  await viewer.run();
}
