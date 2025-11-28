import { setupAlternateScreen } from '../app.js';
import { TaskService } from '../services/task-service.js';
import { run } from '../app.js';

const taskService = new TaskService();

export async function handleInteractive(): Promise<void> {
  setupAlternateScreen();
  const tasks = await taskService.loadTasks();
  await run(tasks);
}

