# Feature: Add Task in Interactive Mode

Press `a` to add tasks without exiting interactive view.

## Implementation

### Phase 1: IO Layer - Text Input

Create `packages/io/src/lib/text-input.ts`

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

Export from `packages/io/src/index.ts`

```typescript
export { TextInput } from './lib/text-input';
```

### Phase 2: UI Layer - Modal & Keybinds

Add keybind to `src/ui/keybinds.ts`

```typescript
ADD: {
  description: 'a: add',
  match: (key) => key.name === 'a' && !key.ctrl,
}
```

Create `src/ui/input-modal.ts`

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

Update `src/ui/renderer.ts` - add import, field, and method:

```typescript
import { InputModal } from './input-modal';

// In constructor:
private readonly inputModal: InputModal;

constructor() {
  this.terminal = new Terminal();
  this.inputModal = new InputModal(this.terminal);
}

// New method:
async promptForText(prompt: string): Promise<string | null> {
  return this.inputModal.show(prompt);
}
```

### Phase 3: View Model

Update `src/ui/task-list-view.ts` - remove `readonly`, add method:

```typescript
private tasks: Task[]; // Remove readonly

addTask(task: Task): void {
  this.tasks.push(task);
}
```

### Phase 4: Integration

Add to `src/ui/interactive.ts`

Import:

```typescript
import { Task } from '@plannet/tasks';
```

Add command in `createCommandRegistry()`:

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

Implement handler:

```typescript
private async handleAdd(): Promise<void> {
  this.keypressHandler.stop();

  try {
    const input = await this.renderer.promptForText('Add new task:');
    if (input) {
      this.viewModel.addTask(new Task(input));
    }
  } catch (error) {
    console.error('Failed to add task:', error);
  } finally {
    this.render();
    this.setupKeypress();
  }
}
```
