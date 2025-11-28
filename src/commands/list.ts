import { TaskService } from '../services/task-service.js';

const taskService = new TaskService();

export async function handleList(): Promise<void> {
  const tasks = await taskService.loadTasks();
  process.stdout.write(tasks.join('\n') + '\n');
}

