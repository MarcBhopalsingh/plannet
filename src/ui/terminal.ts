export class Terminal {
  switchToAlternateScreen(): void {
    process.stdout.write('\x1b[?1049h');
  }

  switchToMainScreen(): void {
    process.stdout.write('\x1b[?1049l');
  }

  clearScreen(): void {
    process.stdout.write('\x1b[2J\x1b[H');
  }

  hideCursor(): void {
    process.stdout.write('\x1b[?25l');
  }

  showCursor(): void {
    process.stdout.write('\x1b[?25h');
  }

  setupAlternateScreen(): void {
    this.switchToAlternateScreen();
    this.clearScreen();
    this.hideCursor();
  }

  restoreMainScreen(): void {
    this.showCursor();
    this.switchToMainScreen();
  }

  write(text: string): void {
    process.stdout.write(text);
  }

  writeLine(text: string): void {
    process.stdout.write(text + '\n');
  }
}

