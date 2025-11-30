import { Renderer } from '@ui/renderer';
import { InteractiveTaskViewer } from '@ui/interactive';
import { TaskService } from '@services';

export async function handleInteractive(): Promise<void> {
  const taskService = new TaskService();
  const tasks = await taskService.loadTasks();

  const renderer = new Renderer();
  const viewer = new InteractiveTaskViewer(renderer, taskService, tasks);
  await viewer.run();
}
