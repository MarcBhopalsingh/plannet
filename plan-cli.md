# Refactoring Plan: CLI Command Registry

## Overview

Refactor `src/cli.ts` to improve code organization, maintainability, and separation of concerns by:

- Replacing switch-case statement with a command registry pattern
- Centralizing command definitions with aliases and metadata
- Automatically generating help text from command definitions
- Improving type safety and extensibility

## Goals

1. Replace switch-case with a Map-based command registry
2. Centralize command definitions with aliases, descriptions, and handlers
3. Add validation metadata (e.g., `requiresArgs`) to command definitions
4. Generate help text automatically from command definitions
5. Keep help text in sync with command definitions
6. Make it easy to add new commands

## Changes

### 1. Create `src/commands/registry.ts`

**Purpose**: Centralize all CLI command definitions in a simple, straightforward structure

**Contents**:

- Export `CommandHandler` type: `(args: string[]) => Promise<void> | void`
- Export `CommandDefinition` interface with:
  - `description`: string for help text (e.g., "interactive - Run in interactive mode")
  - `aliases`: string[] for command names (e.g., ['interactive', 'i'])
  - `handler`: CommandHandler function
  - `requiresArgs?`: optional boolean flag for validation
- Define `COMMANDS` constant object with all commands
- Export `findCommand(commandName: string)` function to lookup commands by name
- Export `getCommandHelpText()` function to generate help text from command descriptions

**Example Structure**:

```typescript
export type CommandHandler = (args: string[]) => Promise<void> | void;

export interface CommandDefinition {
  description: string;
  aliases: string[];
  handler: CommandHandler;
  requiresArgs?: boolean;
}

export const COMMANDS = {
  INTERACTIVE: {
    description: 'interactive - Run in interactive mode',
    aliases: ['interactive', 'i'],
    handler: async () => {
      const { handleInteractive } = await import('./interactive');
      await handleInteractive();
    },
  },
  LIST: {
    description: 'list - List all tasks',
    aliases: ['list', 'ls'],
    handler: async () => {
      const { handleList } = await import('./list');
      await handleList();
    },
  },
  ADD: {
    description: 'add - Add a new task',
    aliases: ['add', 'a'],
    requiresArgs: true,
    handler: async (args: string[]) => {
      if (args.length === 0) {
        throw new Error('"add" command requires a task description');
      }
      const { handleAdd } = await import('./add');
      await handleAdd(args.join(' '));
    },
  },
} as const;

export function findCommand(
  commandName: string
): CommandDefinition | undefined {
  return Object.values(COMMANDS).find((cmd) =>
    cmd.aliases.includes(commandName)
  );
}

export function getCommandHelpText(): string {
  return Object.values(COMMANDS)
    .map((cmd) => `  ${cmd.description}`)
    .join('\n');
}
```

**Benefits**:

- Single source of truth for commands
- Simple, direct structure (no complex abstractions)
- Easy to read and understand
- Easy to add/modify commands
- Help text automatically stays in sync
- Type-safe command definitions
- Built-in validation support

### 2. Update `src/cli.ts`

**Changes**:

- Remove switch-case statement
- Import `findCommand` from `@commands/registry`
- Replace `executeCommand()` implementation with registry lookup
- Use command definition's `requiresArgs` for validation
- Call handler with args array

**Before**:

```typescript
async function executeCommand(command: string, args: string[]): Promise<void> {
  switch (command) {
    case 'interactive':
    case 'i':
      await handleInteractive();
      break;
    case 'list':
    case 'ls':
      await handleList();
      break;
    case 'add':
    case 'a':
      if (args.length === 0) {
        console.error('Error: "add" command requires a task description');
        process.exit(1);
      }
      await handleAdd(args.join(' '));
      break;
    default:
      await displayUsageAndExit();
  }
}
```

**After**:

```typescript
import { findCommand } from '@commands/registry';
import { displayUsageAndExit } from '@commands/usage';

async function executeCommand(command: string, args: string[]): Promise<void> {
  const commandDef = findCommand(command);

  if (!commandDef) {
    await displayUsageAndExit();
    return;
  }

  if (commandDef.requiresArgs && args.length === 0) {
    throw new Error(`"${commandDef.aliases[0]}" command requires arguments`);
  }

  await commandDef.handler(args);
}
```

**Benefits**:

- ✅ No switch-case - uses registry lookup instead
- ✅ Cleaner, more maintainable structure
- ✅ Validation logic centralized in command definitions
- ✅ Easy to add new commands - just add to COMMANDS object
- ✅ Consistent error handling
- ✅ Type-safe command execution

### 3. Update `src/commands/usage.ts`

**Changes**:

- Import `getCommandHelpText` from `@commands/registry`
- Replace hardcoded command list with `getCommandHelpText()`
- Keep existing structure and formatting

**Before**:

```typescript
export async function displayUsageAndExit(): Promise<void> {
  const terminal = new Terminal();
  terminal.writeLine('No command provided');
  terminal.writeLine('Usage: plannet <command>');
  terminal.writeLine('Commands:');
  terminal.writeLine('  interactive - Run in interactive mode');
  terminal.writeLine('  list - List all tasks');
  terminal.writeLine('  add - Add a new task');
  terminal.writeLine('  help - Show help');
  process.exit(0);
}
```

**After**:

```typescript
import { Terminal } from '@ui/terminal';
import { getCommandHelpText } from './registry';

export async function displayUsageAndExit(): Promise<void> {
  const terminal = new Terminal();
  terminal.writeLine('No command provided');
  terminal.writeLine('Usage: plannet <command>');
  terminal.writeLine('Commands:');
  terminal.writeLine(getCommandHelpText());
  process.exit(0);
}
```

**Benefits**:

- Help text automatically reflects command changes
- Single source of truth for command descriptions
- No risk of help text getting out of sync

## Architecture Layers (After Refactoring)

```
┌─────────────────────────────────────┐
│   cli.ts                            │  ← Entry point
│   (parses argv, finds command)      │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼──────────┐
    │  Command Registry   │  ← Configuration layer
    │  (registry.ts)      │
    │  - COMMANDS         │
    │  - findCommand()    │
    │  - getCommandHelpText() │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │  Command Handlers   │  ← Execution layer
    │  (interactive.ts)   │
    │  (list.ts)          │
    │  (add.ts)           │
    │  (usage.ts)         │
    └─────────────────────┘
```

## Implementation Order

1. ✅ Create `src/commands/registry.ts` with command definitions
2. ✅ Update `src/cli.ts` to use registry instead of switch-case
3. ✅ Update `src/commands/usage.ts` to use `getCommandHelpText()`
4. ✅ Test that all commands still work
5. ✅ Verify help text is correct

## Testing Checklist

- [ ] `plannet interactive` works
- [ ] `plannet i` works (alias)
- [ ] `plannet list` works
- [ ] `plannet ls` works (alias)
- [ ] `plannet add "task description"` works
- [ ] `plannet a "task description"` works (alias)
- [ ] `plannet add` without args shows error
- [ ] `plannet` (no command) shows usage
- [ ] `plannet invalid` shows usage
- [ ] Help text displays all commands correctly
- [ ] Help text matches command definitions

## Notes

- Commands use simple string aliases (no complex matching logic) for clarity
- All command logic is abstracted into handler functions
- Help text is generated from command definitions to prevent drift
- Command handlers use dynamic imports to avoid circular dependencies
- Validation is built into command definitions via `requiresArgs` flag
- Error handling remains in `cli.ts` for consistent error reporting
