import { Terminal } from '../ui/terminal.js';
import { Renderer } from '../ui/renderer.js';
import { InteractiveTaskViewer } from '../ui/interactive.js';
import { getTaskService } from '../services/index.js';

export async function handleInteractive(): Promise<void> {
  const taskService = getTaskService();
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

