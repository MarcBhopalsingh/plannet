# Feature: Add Task in Interactive Mode

Press `a` to add tasks without exiting interactive view.

## Architecture

Two-layer: `TextInput` (io package) handles character collection, `InputModal` (ui package) handles presentation.

## Implementation Plan

### Phase 1: IO Layer - Text Input

**Step 1.1:** Create `packages/io/src/lib/text-input.ts`

```typescript
import * as readline from 'readline';

export class TextInput {
  async collect(onUpdate: (input: string) => void): Promise<string | null> {
    let input = '';

    return new Promise((resolve) => {
      onUpdate(input);

      const listener = (str: string, key: readline.Key) => {
        if (key.name === 'return') {
          cleanup();
          resolve(input.trim() || null);
        } else if (key.name === 'escape') {
          cleanup();
          resolve(null);
        } else if (key.name === 'backspace') {
          input = input.slice(0, -1);
          onUpdate(input);
        } else if (str && !key.ctrl && !key.meta) {
          input += str;
          onUpdate(input);
        }
      };

      const cleanup = () => {
        process.stdin.removeListener('keypress', listener);
      };

      process.stdin.on('keypress', listener);
    });
  }
}
```

**Step 1.2:** Export from `packages/io/src/index.ts`

```typescript
export { TextInput } from './lib/text-input';
```

**Verify:** Can import `TextInput` from `@plannet/io`

---

### Phase 2: UI Layer - Modal & Keybinds

**Step 2.1:** Add keybind to `src/ui/keybinds.ts`

```typescript
ADD: {
  description: 'a: add',
  match: (key) => key.name === 'a' && !key.ctrl,
}
```

**Step 2.2:** Create `src/ui/input-modal.ts`

```typescript
import { Terminal, TextInput } from '@plannet/io';

const MODAL_STYLE = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  CURSOR: '█',
} as const;

export class InputModal {
  private readonly textInput: TextInput;

  constructor(private terminal: Terminal) {
    this.textInput = new TextInput();
  }

  async show(prompt: string): Promise<string | null> {
    this.terminal.showCursor();

    try {
      return await this.textInput.collect((input) => {
        this.render(prompt, input);
      });
    } finally {
      this.terminal.hideCursor();
    }
  }

  private render(prompt: string, input: string): void {
    this.terminal.clearScreen();
    this.terminal.writeLine(
      `\n  ${MODAL_STYLE.BOLD}${prompt}${MODAL_STYLE.RESET} ${input}${MODAL_STYLE.CURSOR}`
    );
    this.terminal.writeLine(
      `\n  ${MODAL_STYLE.DIM}Enter: save  •  Esc: cancel${MODAL_STYLE.RESET}\n`
    );
  }
}
```

**Step 2.3:** Add `promptForText()` to `src/ui/renderer.ts`

Add import:

```typescript
import { InputModal } from './input-modal';
```

Add to constructor:

```typescript
private readonly inputModal: InputModal;

constructor() {
  this.terminal = new Terminal();
  this.inputModal = new InputModal(this.terminal);
}
```

Add method:

```typescript
async promptForText(prompt: string): Promise<string | null> {
  return this.inputModal.show(prompt);
}
```

**Verify:** Renderer compiles, can call `promptForText()`

---

### Phase 3: Service Layer - Persistence

**Step 3.1:** Update `addTask()` in `src/services/task-service.ts`

Change signature and return value:

```typescript
async addTask(taskText: string): Promise<Task[]> {
  const tasks = await this.loadTasks();
  tasks.push(new Task(taskText, false));
  await this.saveTasks(tasks);
  return tasks;
}
```

**Verify:** CLI `add` command still works (may need to update if it uses return value)

---

### Phase 4: View Model - State Management

**Step 4.1:** Update `src/ui/task-list-view.ts`

Remove `readonly` from tasks field:

```typescript
private tasks: Task[]; // Was: private readonly tasks: Task[]
```

Add `reload()` method:

```typescript
reload(tasks: Task[]): void {
  this.tasks.splice(0, this.tasks.length, ...tasks);
  this.selectedIndex = Math.min(
    this.selectedIndex,
    Math.max(0, tasks.length - 1)
  );
}
```

**Verify:** TaskListView compiles

---

### Phase 5: Integration - Wire It Together

**Step 5.1:** Add command to `src/ui/interactive.ts`

In `createCommandRegistry()`, add:

```typescript
[
  KEYBINDS.ADD,
  {
    name: 'add',
    shouldRerender: false,
    execute: () => this.handleAdd(),
  },
];
```

**Step 5.2:** Implement `handleAdd()` in `src/ui/interactive.ts`

```typescript
private async handleAdd(): Promise<void> {
  this.keypressHandler.stop();

  try {
    const input = await this.renderer.promptForText('Add new task:');

    if (input) {
      const tasks = await this.taskService.addTask(input);
      this.viewModel.reload(tasks);
    }
  } catch (error) {
    console.error('Failed to add task:', error);
  } finally {
    this.render();
    this.setupKeypress();
  }
}
```

**Verify:** Code compiles

---

### Phase 6: Testing

**Step 6.1:** Manual Testing - Basic Flow

- [ ] Run interactive mode
- [ ] Press 'a', see modal UI
- [ ] Type "Test task", press Enter
- [ ] Verify task appears in list
- [ ] Verify task saved to tasks.json

**Step 6.2:** Manual Testing - Input Handling

- [ ] Press 'a', type characters, see live preview
- [ ] Press backspace, verify characters removed
- [ ] Press Escape, verify cancels without saving

**Step 6.3:** Manual Testing - Edge Cases

- [ ] Press 'a', press Enter immediately (empty input)
- [ ] Press 'a', type spaces only, press Enter
- [ ] Verify no tasks created for empty/whitespace

**Step 6.4:** Manual Testing - Stability

- [ ] Add task, verify selection stays on current task
- [ ] Add multiple tasks in sequence
- [ ] Use j/k/space after adding, verify keybinds work
- [ ] Press Ctrl+C, verify quits properly

**Step 6.5:** Manual Testing - Error Handling

- [ ] Make tasks.json read-only, try to add task
- [ ] Verify error logged, UI returns to normal
- [ ] Verify can still use other keybinds

---

## Testing Checklist Summary

- [ ] Press 'a', see modal UI
- [ ] Type characters, see live preview
- [ ] Backspace removes characters
- [ ] Enter with text: saves task, returns to list
- [ ] Enter with empty/whitespace: no task saved
- [ ] Escape: cancels, no task saved
- [ ] New task appears at bottom
- [ ] Selection stays on current task (stable)
- [ ] Task persists to disk
- [ ] All keybinds work after add
- [ ] Multiple adds in sequence
- [ ] Ctrl+C quits properly
- [ ] Error during save doesn't break UI
