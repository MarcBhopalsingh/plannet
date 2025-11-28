import { TaskService } from '@services';

export async function handleAdd(taskText: string): Promise<void> {
  const taskService = new TaskService();
  await taskService.addTask(taskText);
}
