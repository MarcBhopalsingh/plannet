# Plannet

A command-line task management tool for tracking and managing tasks locally.

## Overview

Plannet is a CLI application that manages tasks stored in a local `tasks.json` file. It provides commands to add, list, and interactively manage tasks.

## Installation

```bash
npm install
```

## Development

### Build

```bash
npm run build
```

### Run in Development Mode

```bash
npm run dev
```

### Run Interactive Mode

```bash
npm run dev:interactive
```

### Type Checking

```bash
npm run typecheck
```

## Usage

After building, the CLI is available via the `plannet` command:

- `plannet add <description>` - Add a new task
- `plannet list` or `plannet ls` - List all tasks
- `plannet interactive` or `plannet i` - Launch interactive mode

Tasks are stored in `tasks.json` in the current working directory.

## Project Structure

- `src/cli.ts` - Main CLI entry point
- `src/commands/` - Command handlers
- `src/services/` - Task management service
- `src/ui/` - Terminal UI components
- `src/types.ts` - Type definitions
