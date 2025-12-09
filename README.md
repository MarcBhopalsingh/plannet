# Plannet

A command-line task management tool for tracking and managing tasks locally.

## Overview

Plannet is a CLI application that manages tasks organized into projects, stored locally as JSON files. It provides both direct commands and an interactive TUI mode.

## Installation

```bash
npm install
```

## Development

```bash
npm run build              # Build the project
npm run dev                # Run CLI in dev mode
npm run dev:interactive    # Run interactive mode in dev
npm run typecheck          # Type check
```

### Build Standalone Executable

Requires [Bun](https://bun.sh):

```bash
npm run build:exe          # Build for current platform
npm run build:exe:all      # Build for all platforms (macOS, Linux, Windows)
```

Outputs to `dist/bin/`.

## Usage

```bash
plannet add <description>    # Add a new task
plannet list                 # List all tasks
plannet interactive          # Launch interactive mode
```

Tasks are stored in `.plannet/` in the current working directory.

## Interactive Mode Keybindings

| Key          | Action                 |
| ------------ | ---------------------- |
| `↑`/`k`      | Move up                |
| `↓`/`j`      | Move down              |
| `Space`      | Toggle task completion |
| `a`          | Add task               |
| `e`          | Edit task              |
| `d`          | Delete task            |
| `s`          | Sort tasks             |
| `p`          | Add project            |
| `m`          | Move task to project   |
| `Tab`        | Next project           |
| `f`          | Toggle fold project    |
| `F`          | Toggle fold all        |
| `q`/`Ctrl+C` | Quit                   |

## Project Structure

```
src/
├── cli.ts              # Main CLI entry point
├── commands/           # Command handlers (add, list, interactive)
└── ui/                 # Interactive TUI components
packages/
├── io/                 # Terminal I/O and input handling
└── tasks/              # Task and project data models
```
