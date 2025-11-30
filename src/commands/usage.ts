import { Terminal } from '@ui/terminal';

export function displayUsage(): void {
  const terminal = new Terminal();
  terminal.writeLine('Usage: plannet <command>');
  terminal.writeLine('Commands:');
  terminal.writeLine('  interactive - Run in interactive mode');
  terminal.writeLine('  list - List all tasks');
  terminal.writeLine('  add - Add a new task');
}
