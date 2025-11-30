import { TaskService } from '@plannet/services';

export async function handleAdd(taskText: string): Promise<void> {
  const taskService = new TaskService();
  await taskService.addTask(taskText);
}
