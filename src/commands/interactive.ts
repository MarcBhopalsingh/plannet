import { Renderer } from '@plannet/ui';
import { InteractiveTaskViewer } from '@plannet/ui';
import { TaskService } from '@plannet/services';

export async function handleInteractive(): Promise<void> {
  const taskService = new TaskService();
  const tasks = await taskService.loadTasks();

  const renderer = new Renderer();
  const viewer = new InteractiveTaskViewer(renderer, taskService, tasks);
  await viewer.run();
}
