import { getTaskService } from '../services/index.js';

export async function handleAdd(taskText: string): Promise<void> {
  const taskService = getTaskService();
  await taskService.addTask(taskText);
}

