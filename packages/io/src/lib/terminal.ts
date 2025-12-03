import { ANSI } from './ansi';

export class Terminal {
  switchToAlternateScreen(): void {
    process.stdout.write(ANSI.ALTERNATE_SCREEN_ON);
  }

  switchToMainScreen(): void {
    process.stdout.write(ANSI.ALTERNATE_SCREEN_OFF);
  }

  clearScreen(): void {
    process.stdout.write(ANSI.CLEAR_SCREEN);
  }

  hideCursor(): void {
    process.stdout.write(ANSI.HIDE_CURSOR);
  }

  showCursor(): void {
    process.stdout.write(ANSI.SHOW_CURSOR);
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

  getRows(): number {
    return process.stdout.rows || 24;
  }

  getColumns(): number {
    return process.stdout.columns || 80;
  }

  moveCursor(row: number, col: number): void {
    process.stdout.write(`\x1b[${row};${col}H`);
  }
}
