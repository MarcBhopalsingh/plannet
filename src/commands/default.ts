import { Terminal } from '@ui/terminal';

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
