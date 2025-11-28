import { Terminal } from './ui/terminal.js';
import { Renderer } from './ui/renderer.js';
import { InteractiveTaskViewer } from './ui/interactive.js';
import { Task } from './types.js';

const terminal = new Terminal();
const renderer = new Renderer(terminal);

export function setupAlternateScreen(): void {
  terminal.setupAlternateScreen();
}

export function restoreMainScreen(): void {
  terminal.restoreMainScreen();
}

export async function run(tasks: Task[]): Promise<void> {
  const viewer = new InteractiveTaskViewer(terminal, renderer, tasks);
  await viewer.run();
}
