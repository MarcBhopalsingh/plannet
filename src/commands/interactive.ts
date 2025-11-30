import { Renderer } from '@plannet/ui';
import { InteractiveTaskViewer } from '@plannet/ui';
import { TaskRepository } from '@plannet/tasks';

export async function handleInteractive(): Promise<void> {
  const taskRepo = new TaskRepository();
  const tasks = await taskRepo.findAll();

  const renderer = new Renderer();
  const viewer = new InteractiveTaskViewer(renderer, taskRepo, tasks);
  await viewer.run();
}
