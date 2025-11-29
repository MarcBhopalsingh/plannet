# Plan: Renderer Terminal Encapsulation

## Overview

Encapsulate Terminal within Renderer. Viewer manages its own lifecycle through Renderer, including alternate screen setup/teardown. This moves terminal lifecycle management from the command layer into the viewer, improving encapsulation.

## Goals

1. Renderer creates Terminal internally
2. Renderer exposes `setupAlternateScreen()` and `restoreMainScreen()`
3. Viewer uses Renderer for all terminal operations
4. Viewer manages its own lifecycle (setup/teardown) internally
5. Command layer no longer needs to manage terminal lifecycle

## Changes

### 1. `src/ui/renderer.ts`

- Remove Terminal constructor parameter
- Create Terminal internally
- Add `setupAlternateScreen()` and `restoreMainScreen()` methods

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

### 2. `src/ui/interactive.ts`

- Move terminal lifecycle management into viewer
- Call `renderer.setupAlternateScreen()` in `run()` before rendering
- Call `renderer.restoreMainScreen()` in `handleQuit()` after cleanup
- Keep promise/resolve pattern (necessary for async exit)

```typescript
async run(): Promise<void> {
  this.renderer.setupAlternateScreen();
  this.render();

  return new Promise((resolve) => {
    this.setupKeypress(resolve);
  });
}

private setupKeypress(resolve: () => void): void {
  // ... existing setup code ...

  this.keypressHandler = (str: string, key: readline.Key) => {
    if (key.name === 'q' || (key.name === 'c' && key.ctrl)) {
      this.handleQuit(resolve).catch((error) => {
        console.error('Error saving tasks:', error);
        this.cleanup();
        this.renderer.restoreMainScreen();
        resolve();
      });
    }
    // ... other key handlers ...
  };

  // ... rest of setup ...
}

private async handleQuit(resolve: () => void): Promise<void> {
  await this.taskService.saveTasks(this.viewModel.getTasksForSave());
  this.cleanup();
  this.renderer.restoreMainScreen();
  resolve();
}
```

### 3. `src/commands/interactive.ts`

- Remove Terminal import and creation
- Remove try/finally block

```typescript
const renderer = new Renderer();
const viewer = new InteractiveTaskViewer(renderer, taskService, tasks);
await viewer.run();
```

## Implementation Order

1. Update `src/ui/renderer.ts`
2. Update `src/ui/interactive.ts`
3. Update `src/commands/interactive.ts`
4. Test interactive mode

## Notes

- Other commands (`usage.ts`, `list.ts`) continue using Terminal directly
- Maintains abstraction: viewer → renderer → terminal
- Promise/resolve pattern is kept because it's the cleanest way to handle async exit from the keypress handler
- Viewer is now self-contained and manages its own lifecycle
