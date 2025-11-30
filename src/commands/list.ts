import { TaskRepository } from '@plannet/tasks';
import { Terminal } from '@plannet/io';

export async function handleList(): Promise<void> {
  const taskRepo = new TaskRepository();
  const tasks = await taskRepo.findAll();

  const terminal = new Terminal();
  tasks.forEach((task) => {
    const prefix = task.completed ? '[x]' : '[ ]';
    terminal.writeLine(`${prefix} ${task.description}`);
  });
}
