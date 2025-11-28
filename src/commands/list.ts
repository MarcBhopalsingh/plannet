import { TaskService } from '@services';
import { Terminal } from '@ui/terminal';

export async function handleList(): Promise<void> {
  const taskService = new TaskService();
  const tasks = await taskService.loadTasks();
  
  const terminal = new Terminal();
  terminal.writeLine(tasks.join('\n'));
}

