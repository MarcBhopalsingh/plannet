import { Terminal } from '@ui/terminal';
import { Renderer } from '@ui/renderer';
import { InteractiveTaskViewer } from '@ui/interactive';
import { TaskService } from '@services';

export async function handleInteractive(): Promise<void> {
  const taskService = new TaskService();
  const tasks = await taskService.loadTasks();

  const terminal = new Terminal();
  const renderer = new Renderer(terminal);
  const viewer = new InteractiveTaskViewer(terminal, renderer, tasks);

  terminal.setupAlternateScreen();
  try {
    await viewer.run();
  } finally {
    terminal.restoreMainScreen();
  }
}
