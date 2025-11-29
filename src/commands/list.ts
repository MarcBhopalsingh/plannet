import { TaskService } from '@services';
import { Terminal } from '@ui/terminal';

export async function handleList(): Promise<void> {
  const taskService = new TaskService();
  const tasks = await taskService.loadTasks();

  const terminal = new Terminal();
  tasks.forEach((task) => {
    const prefix = task.completed ? '[x]' : '[ ]';
    terminal.writeLine(`${prefix} ${task.description}`);
  });
}
