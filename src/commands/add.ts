import { TaskService } from '../services/task-service.js';

const taskService = new TaskService();

export async function handleAdd(taskText: string): Promise<void> {
  await taskService.addTask(taskText);
}

