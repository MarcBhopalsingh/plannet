# Migration Plan: @plannet/tasks Library

## Phase 1: Delete Placeholder

```bash
rm packages/tasks/src/lib/tasks.ts
```

## Phase 2: Create Library Files

### `packages/tasks/src/lib/task.ts`

Copy from `src/types.ts`:

```typescript
export class Task {
  description: string;
  completed: boolean;

  constructor(description: string, completed: boolean = false) {
    this.description = description;
    this.completed = completed;
  }

  toggleCompletion(): void {
    this.completed = !this.completed;
  }
}
```

### `packages/tasks/src/lib/task-repository.ts`

Refactor from `src/services/task-service.ts`:

```typescript
import { readFile, writeFile } from 'fs/promises';
import { Task } from './task';

export class TaskRepository {
  constructor(private readonly tasksFile: string = 'tasks.json') {}

  private isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
    return (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    );
  }

  async findAll(): Promise<Task[]> {
    try {
      const content = await readFile(this.tasksFile, 'utf-8');
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map(
        (item) => new Task(item.description, item.completed ?? false)
      );
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        return [];
      }
      return [];
    }
  }

  async save(tasks: Task[]): Promise<void> {
    const content = JSON.stringify(tasks, null, 2);
    await writeFile(this.tasksFile, content, 'utf-8');
  }

  async add(task: Task): Promise<void> {
    const tasks = await this.findAll();
    tasks.push(task);
    await this.save(tasks);
  }
}
```

### `packages/tasks/src/lib/task-stats.ts`

```typescript
import { Task } from './task';

export interface TaskStats {
  total: number;
  completed: number;
}

export function getTaskStats(tasks: Task[]): TaskStats {
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
  };
}
```

### `packages/tasks/src/index.ts`

```typescript
export { Task } from './lib/task';
export { TaskRepository } from './lib/task-repository';
export { getTaskStats, TaskStats } from './lib/task-stats';
```

## Phase 3: Update App Imports

### `src/commands/add.ts`

```typescript
import { TaskRepository, Task } from '@plannet/tasks';

export async function handleAdd(taskText: string): Promise<void> {
  const taskRepo = new TaskRepository();
  await taskRepo.add(new Task(taskText));
}
```

### `src/commands/list.ts`

```typescript
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
```

### `src/commands/interactive.ts`

```typescript
import { TaskRepository } from '@plannet/tasks';

export async function handleInteractive(): Promise<void> {
  const taskRepo = new TaskRepository();
  const tasks = await taskRepo.findAll();

  const renderer = new Renderer();
  const viewer = new InteractiveTaskViewer(renderer, taskRepo, tasks);
  await viewer.run();
}
```

### `src/ui/interactive.ts`

Update constructor parameter and usage:

```typescript
import { TaskRepository, Task, getTaskStats } from '@plannet/tasks';

export class InteractiveTaskViewer {
  constructor(
    private readonly renderer: Renderer,
    private readonly taskRepo: TaskRepository,
    tasks: Task[]
  ) {
    // ...
  }

  private render(): void {
    const stats = getTaskStats(this.viewModel.getTasks());
    // ...
  }

  private async handleQuit(): Promise<void> {
    try {
      await this.taskRepo.save(this.viewModel.getTasksForSave());
    } catch (error) {
      console.error('Error saving tasks:', error);
    } finally {
      // ...
    }
  }
}
```

### `src/ui/renderer.ts`

```typescript
import { Task, TaskStats } from '@plannet/tasks';

export class Renderer {
  render(
    tasks: Task[],
    selectedIndex: number,
    stats: TaskStats
  ): void {
    // ...
  }
}
```

### `src/ui/task-list-view.ts`

```typescript
import { Task } from '@plannet/tasks';
```

## Phase 4: Update `tsconfig.json`

Add to `compilerOptions.paths`:

```json
"@plannet/tasks": ["packages/tasks/src/index.ts"]
```

## Phase 5: Delete Old Files

```bash
rm src/types.ts
rm -rf src/services
```

## Phase 6: Test

```bash
nx build
nx dev interactive
nx dev list
nx dev add "test task"
```

