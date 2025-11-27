import * as readline from 'readline';

export async function run(): Promise<void> {
  setupKeypress();

  console.log('Plannet is running! Press "q" to exit...');

  return new Promise((resolve) => {
    process.stdin.on('keypress', (str: string, key: readline.Key) => {
      if (key.name === 'q') {
        console.log('\nExiting...');
        cleanup();
        resolve();
      }
    });
  });
}

function setupKeypress(): void {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
}

function cleanup(): void {
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
}
