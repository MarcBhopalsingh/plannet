# Refactoring Plan: Interactive Task Viewer

## Overview

Refactor `src/ui/interactive.ts` to improve code organization, maintainability, and separation of concerns by:

- Extracting keybind definitions and stdin operations into dedicated layers
- Encapsulating Terminal lifecycle within Renderer
- Moving terminal lifecycle management into viewer for better encapsulation

## Goals

1. Extract keybind definitions into a centralized configuration file
2. Extract stdin operations into a dedicated `InputHandler` class (mirroring `Terminal` pattern)
3. Improve keypress handler structure (remove nested if-else chains)
4. Encapsulate Terminal creation and lifecycle within Renderer
5. Viewer manages its own lifecycle (setup/teardown) internally
6. Keep help text in sync with keybind definitions

## Changes

### 1. Create `src/ui/keybinds.ts`

**Purpose**: Centralize all keybind definitions in a simple, straightforward structure

**Contents**:

- Export `KeyMatcher` type: `(key: readline.Key) => boolean`
- Define `KEYBINDS` constant object with:
  - `QUIT`: q or Ctrl+C
  - `MOVE_UP`: up arrow or k (without Ctrl)
  - `MOVE_DOWN`: down arrow or j (without Ctrl)
  - `TOGGLE`: space
- Each keybind includes:
  - `description`: string for help text (e.g., "q: quit", "↑/k: move up")
  - `match`: simple function that takes a key and returns boolean
- Export `getKeybindHelpText()` function to generate help text from keybind descriptions

**Example Structure**:

```typescript
export const KEYBINDS = {
  QUIT: {
    description: 'q: quit',
    match: (key: readline.Key) =>
      key.name === 'q' || (key.name === 'c' && key.ctrl),
  },
  MOVE_UP: {
    description: '↑/k: move up',
    match: (key: readline.Key) =>
      key.name === 'up' || (key.name === 'k' && !key.ctrl),
  },
  // ... etc
} as const;
```

**Benefits**:

- Single source of truth for keybinds
- Simple, direct match functions (no complex helper abstractions)
- Easy to read and understand
- Easy to add/modify keybinds
- Help text automatically stays in sync

### 2. Create `src/ui/input-handler.ts`

**Purpose**: Abstract all stdin operations into a dedicated class (mirroring `Terminal` pattern)

**Contents**:

- `InputHandler` class with:
  - `setup(handler: KeypressHandler)`: Initialize raw mode and register keypress handler
  - `cleanup()`: Remove handler, restore normal mode, pause stdin
  - `isActive()`: Check if handler is currently active
- Internal state management:
  - Track if setup has been called
  - Store keypress handler reference
  - Prevent double setup

**Benefits**:

- Consistent architecture pattern (matches `Terminal`)
- Cleaner API for stdin operations
- Better error handling
- Easier to test and mock

### 3. Update `src/ui/renderer.ts`

**Changes**:

- Remove Terminal from constructor parameter
- Create Terminal internally in constructor
- Add `setupAlternateScreen()` method
- Add `restoreMainScreen()` method
- Import `getKeybindHelpText` from `@ui/keybinds`
- Update `renderHelpText()` to use `getKeybindHelpText()` instead of hardcoded string

**Before**:

```typescript
export class Renderer {
  constructor(private readonly terminal: Terminal) {}
  // ...
}
```

**After**:

```typescript
export class Renderer {
  private readonly terminal: Terminal;

  constructor() {
    this.terminal = new Terminal();
  }

  setupAlternateScreen(): void {
    this.terminal.setupAlternateScreen();
  }

  restoreMainScreen(): void {
    this.terminal.restoreMainScreen();
  }

  // ... existing methods unchanged
}
```

**Benefits**:

- Renderer encapsulates Terminal - cleaner abstraction
- Callers don't need to know about Terminal
- Help text automatically reflects keybind changes

### 4. Update `src/ui/interactive.ts`

**Changes**:

- Remove direct `readline` and `process.stdin` operations
- Remove `keypressHandler` field (now managed by `InputHandler`)
- Keep minimal promise/resolve pattern (necessary for async exit)
- Add `InputHandler` instance as a class field
- Import `KEYBINDS` from `@ui/keybinds`
- Create a command mapping that associates keybinds with action functions
- Update `run()` to:
  - Call `renderer.setupAlternateScreen()` at start
  - Call `setupKeypress()` with resolve callback
  - Return a promise that resolves when quit is called
- Update `setupKeypress()` to:
  - Use `inputHandler.setup()` instead of manual stdin setup
  - Use a command registry pattern instead of if-else chains
  - Accept resolve callback and pass it to command registry
  - Find matching keybind, execute its command, then render once
- Update `handleQuit()` to:
  - Call `renderer.restoreMainScreen()` after cleanup
  - Accept resolve callback to signal completion
- Update `cleanup()` to:
  - Call `inputHandler.cleanup()` instead of manual cleanup

**Command Pattern Approach**:

Instead of if-else chains, create a command registry. Commands are pure actions (no render calls), and we render once after command execution. Keep minimal promise/resolve pattern for clean async exit:

```typescript
export class InteractiveTaskViewer {
  // ... other fields

  private createCommandRegistry(
    resolve: () => void
  ): Map<(typeof KEYBINDS)[keyof typeof KEYBINDS], () => void | Promise<void>> {
    return new Map([
      [KEYBINDS.QUIT, () => this.handleQuit(resolve)],
      [KEYBINDS.MOVE_UP, () => this.viewModel.moveUp()],
      [KEYBINDS.MOVE_DOWN, () => this.viewModel.moveDown()],
      [KEYBINDS.TOGGLE, () => this.viewModel.toggleSelectedTask()],
    ]);
  }

  private async executeCommand(
    command: () => void | Promise<void>,
    keybind: (typeof KEYBINDS)[keyof typeof KEYBINDS]
  ): Promise<void> {
    try {
      await command();
      if (keybind !== KEYBINDS.QUIT) {
        this.render();
      }
    } catch (error) {
      this.handleCommandError(error, keybind);
    }
  }

  private handleCommandError(
    error: unknown,
    keybind: (typeof KEYBINDS)[keyof typeof KEYBINDS]
  ): void {
    if (keybind === KEYBINDS.QUIT) {
      console.error('Error saving tasks:', error);
      this.cleanup();
      this.renderer.restoreMainScreen();
    } else {
      console.error('Error executing command:', error);
      this.render();
    }
  }

  private setupKeypress(resolve: () => void): void {
    const commands = this.createCommandRegistry(resolve);

    this.inputHandler.setup(async (str, key) => {
      const keybind = Object.values(KEYBINDS).find((bind) => bind.match(key));
      if (!keybind) return;

      const command = commands.get(keybind);
      if (!command) return;

      await this.executeCommand(command, keybind);
    });
  }

  async run(): Promise<void> {
    this.renderer.setupAlternateScreen();
    this.render();

    return new Promise((resolve) => {
      this.setupKeypress(resolve);
    });
  }

  private async handleQuit(resolve: () => void): Promise<void> {
    await this.taskService.saveTasks(this.viewModel.getTasksForSave());
    this.cleanup();
    this.renderer.restoreMainScreen();
    resolve();
  }
}
```

**Benefits**:

- ✅ No if-else chains - uses Map lookup instead
- ✅ No Promise.resolve() wrapping - uses async/await directly
- ✅ No if-else in error handling - separate method for error handling
- ✅ Minimal promise/resolve pattern - clean async exit mechanism
- ✅ Single `render()` call in one place (not scattered across commands)
- ✅ Commands are pure actions (no side effects like rendering)
- ✅ Easy to add new commands - just add to the Map
- ✅ Cleaner, more maintainable structure
- ✅ Clear separation: command execution, error handling, and rendering
- ✅ Consistent error handling and rendering logic

### 5. Update `src/commands/interactive.ts`

**Changes**:

- Remove Terminal import and creation
- Remove try/finally block (viewer handles lifecycle through renderer)
- Simplify to just create and run viewer

**Before**:

```typescript
const terminal = new Terminal();
const renderer = new Renderer(terminal);
const viewer = new InteractiveTaskViewer(renderer, taskService, tasks);

terminal.setupAlternateScreen();
try {
  await viewer.run();
} finally {
  terminal.restoreMainScreen();
}
```

**After**:

```typescript
const renderer = new Renderer();
const viewer = new InteractiveTaskViewer(renderer, taskService, tasks);

await viewer.run();
```

**Benefits**:

- Much simpler caller code
- No Terminal management needed
- Viewer is fully self-contained

## Architecture Layers (After Refactoring)

```
┌─────────────────────────────────────┐
│   InteractiveTaskViewer            │  ← Orchestration layer
│   (coordinates everything)          │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼──────┐      ┌───────▼──────┐
│ Renderer │      │ InputHandler │  ← I/O abstraction layers
│ (stdout) │      │ (stdin)      │
│          │      └──────────────┘
│  ┌───────▼──────┐
│  │  Terminal    │  ← Created internally by Renderer
│  └──────────────┘
    │                     │
    │              ┌──────▼──────┐
    │              │  KEYBINDS   │  ← Configuration layer
    │              │  (keybinds)  │
    │              └──────────────┘
    │
┌───▼──────────┐
│ TaskListView │  ← View model layer
└──────────────┘
```

## Implementation Order

1. ✅ Create `src/ui/keybinds.ts`
2. ✅ Create `src/ui/input-handler.ts`
3. ✅ Update `src/ui/renderer.ts` - create Terminal internally, add lifecycle methods, use keybind help text
4. ✅ Update `src/ui/interactive.ts` - use new abstractions, keep minimal promise/resolve pattern
5. ✅ Update `src/commands/interactive.ts` - simplify (no Terminal management)
6. ✅ Test that all functionality still works

## Testing Checklist

- [ ] Quit command (q) works
- [ ] Quit command (Ctrl+C) works
- [ ] Navigation up (arrow key) works
- [ ] Navigation up (k key) works
- [ ] Navigation down (arrow key) works
- [ ] Navigation down (j key) works
- [ ] Toggle task (space) works
- [ ] Help text displays correctly
- [ ] Tasks are saved on quit
- [ ] Cleanup happens correctly on quit
- [ ] No memory leaks (handlers are properly removed)

## Notes

- The `InputHandler` pattern mirrors the existing `Terminal` class pattern for consistency
- Keybinds use simple, direct match functions (no complex helper abstractions) for clarity and simplicity
- All stdin operations are abstracted away from `InteractiveTaskViewer`
- Renderer encapsulates Terminal - callers don't need to know about Terminal
- Viewer manages its own lifecycle through Renderer - uses minimal promise/resolve pattern for clean async exit
- Help text is generated from keybind definitions to prevent drift
- Other commands (`usage.ts`, `list.ts`) continue to create Terminal directly since they don't use Renderer
