# Input Management Refactor Plan

## Problem

**stdin ownership bug**: Multiple classes independently manage stdin, causing conflicts.

When pressing 'a' to add a task:

1. `KeypressHandler.stop()` pauses stdin
2. `TextInput.collect()` tries to read from paused stdin
3. App hangs or exits

## Solution

**Single-owner pattern**: `InputManager` owns stdin, modes just provide handlers.

### Architecture

```
packages/io/           (Infrastructure)
  └── InputManager     Owns stdin, delegates to handlers
  └── Terminal         Owns stdout
  └── Keybind          Type definition

src/ui/                (Application)
  └── modes/
      ├── NavigationMode    Maps keybinds → actions
      └── TextInputMode     Collects text input
  └── interactive.ts        Coordinator
```

## Implementation Steps

### 1. Create `InputManager` (Infrastructure)

**File**: `packages/io/src/lib/input-manager.ts`

```typescript
export type InputHandler = (
  str: string,
  key: readline.Key
) => void | Promise<void>;

export class InputManager {
  start(); // Setup stdin once
  stop(); // Cleanup stdin once
  setHandler(); // Swap handlers (mode switching)
}
```

### 2. Create `NavigationMode` (UI)

**File**: `src/ui/modes/navigation-mode.ts`

```typescript
export type NavigationAction =
  | 'quit'
  | 'moveUp'
  | 'moveDown'
  | 'toggle'
  | 'add';

export class NavigationMode {
  createHandler(): InputHandler; // Maps keybinds → actions
}
```

### 3. Create `TextInputMode` (UI)

**File**: `src/ui/modes/text-input-mode.ts`

```typescript
export class TextInputMode {
  createHandler(onUpdate, onComplete): InputHandler; // Collects text
}
```

### 4. Refactor `InteractiveTaskViewer`

**File**: `src/ui/interactive.ts`

- Replace `KeypressHandler` → `InputManager` + `NavigationMode`
- Replace `TextInput` → `TextInputMode`
- Add `enterNavigationMode()` - sets nav handler
- Add `promptForText()` - sets text handler, returns promise
- Update `addTask()` - switch modes via handler swap

### 5. Update Supporting Files

**File**: `src/ui/renderer.ts`

- Add `renderInputModal(prompt, input)` method

**File**: `src/ui/input-modal.ts`

- Remove async `show()` method
- Keep `render(prompt, input)` for pure rendering

**File**: `packages/io/src/index.ts`

- Export `InputManager` and `InputHandler`
- Remove `KeypressHandler` export

### 6. Delete Deprecated Files

- `packages/io/src/lib/keypress-handler.ts`
- `packages/io/src/lib/text-input.ts`

## File Changes

**New:**

- `packages/io/src/lib/input-manager.ts`
- `src/ui/modes/navigation-mode.ts`
- `src/ui/modes/text-input-mode.ts`

**Modified:**

- `packages/io/src/index.ts`
- `src/ui/interactive.ts`
- `src/ui/renderer.ts`
- `src/ui/input-modal.ts`

**Deleted:**

- `packages/io/src/lib/keypress-handler.ts`
- `packages/io/src/lib/text-input.ts`

## Key Insight

**Vim-style modal interface**: Single persistent stdin listener, mode switching via handler swapping. stdin state managed by single authority.
