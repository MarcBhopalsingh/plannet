import { TaskService } from '@plannet/services';
import { Terminal } from '@plannet/io';

export async function handleList(): Promise<void> {
  const taskService = new TaskService();
  const tasks = await taskService.loadTasks();

  const terminal = new Terminal();
  tasks.forEach((task) => {
    const prefix = task.completed ? '[x]' : '[ ]';
    terminal.writeLine(`${prefix} ${task.description}`);
  });
}
