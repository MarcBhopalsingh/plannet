export async function handleDefault(): Promise<void> {
  console.log('No command provided');
  console.log('Usage: plannet <command>');
  console.log('Commands:');
  console.log('  interactive - Run in interactive mode');
  console.log('  list - List all tasks');
  console.log('  add - Add a new task');
  console.log('  help - Show help');
  process.exit(0);
}

