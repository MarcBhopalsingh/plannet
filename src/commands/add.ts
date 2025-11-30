import { TaskRepository, Task } from '@plannet/tasks';

export async function handleAdd(taskText: string): Promise<void> {
  const taskRepo = new TaskRepository();
  await taskRepo.add(new Task(taskText));
}
