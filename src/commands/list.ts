import { getTaskService } from '../services/index.js';
import { Terminal } from '../ui/terminal.js';

export async function handleList(): Promise<void> {
  const taskService = getTaskService();
  const tasks = await taskService.loadTasks();
  
  const terminal = new Terminal();
  terminal.writeLine(tasks.join('\n'));
}

