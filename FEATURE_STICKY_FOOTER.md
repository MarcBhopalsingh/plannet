# Feature: Sticky Footer Help Text

## Goal

Persistent help text footer at the bottom of the terminal that remains visible regardless of content scrolling.

## Current State

Help text scrolls with content and can be pushed off screen with many tasks.

## Proposed Design

```
╭─ Header (stats) ────────────────────────────────╮
│  7 tasks • 3 completed • 43% done               │
├─────────────────────────────────────────────────┤
│                                                  │
│  → [☐] Task one                                 │
│    [☐] Task two                                 │
│    [✓] Task three                               │
│    ... (scrollable content area)                │
│                                                  │
├─────────────────────────────────────────────────┤
│  q: quit  •  ↑↓: move  •  space: toggle  •  a: add  │
╰─────────────────────────────────────────────────╯
```

**Layout Zones**: Header (stats) → Content (tasks) → Footer (help)

## Implementation

### Terminal Dimension Tracking

`packages/io/src/lib/terminal.ts`

```typescript
export class Terminal {
  getRows(): number {
    return process.stdout.rows || 24;
  }

  getColumns(): number {
    return process.stdout.columns || 80;
  }

  moveCursor(row: number, col: number): void {
    process.stdout.write(`\x1b[${row};${col}H`);
  }

  saveCursor(): void {
    process.stdout.write('\x1b7');
  }

  restoreCursor(): void {
    process.stdout.write('\x1b8');
  }
}
```

Export from `packages/io/src/index.ts`

### Layout Calculator

`src/ui/layout.ts` (new)

```typescript
export interface LayoutDimensions {
  headerHeight: number;
  contentHeight: number;
  footerHeight: number;
  totalHeight: number;
  width: number;
}

export class LayoutCalculator {
  private static readonly MIN_CONTENT_HEIGHT = 5;
  private static readonly HEADER_HEIGHT = 2;
  private static readonly FOOTER_HEIGHT = 2;

  static calculate(
    terminalRows: number,
    terminalCols: number
  ): LayoutDimensions {
    const headerHeight = this.HEADER_HEIGHT;
    const footerHeight = this.FOOTER_HEIGHT;
    const contentHeight = Math.max(
      terminalRows - headerHeight - footerHeight,
      this.MIN_CONTENT_HEIGHT
    );

    return {
      headerHeight,
      contentHeight,
      footerHeight,
      totalHeight: terminalRows,
      width: terminalCols,
    };
  }

  static shouldCompactMode(terminalRows: number): boolean {
    return terminalRows < 12; // Too small for full layout
  }
}
```

### Renderer Updates

`src/ui/renderer.ts`

```typescript
export class Renderer {
  render(tasks: Task[], selectedIndex: number, stats: TaskStats): void {
    const dimensions = LayoutCalculator.calculate(
      this.terminal.getRows(),
      this.terminal.getColumns()
    );

    this.terminal.clearScreen();

    if (LayoutCalculator.shouldCompactMode(dimensions.totalHeight)) {
      this.renderCompactMode(tasks, selectedIndex, stats);
      return;
    }

    this.renderWithStickyFooter(tasks, selectedIndex, stats, dimensions);
  }

  private renderWithStickyFooter(
    tasks: Task[],
    selectedIndex: number,
    stats: TaskStats,
    dimensions: LayoutDimensions
  ): void {
    // 1. Render header at top
    this.terminal.moveCursor(1, 0);
    this.renderStatsLine(stats.total, stats.completed);

    // 2. Render content in middle section
    this.renderTaskListInBounds(tasks, selectedIndex, dimensions.contentHeight);

    // 3. Render footer at bottom
    this.renderStickyFooter(dimensions.totalHeight, dimensions.width);
  }

  private renderStickyFooter(
    terminalHeight: number,
    terminalWidth: number
  ): void {
    const separator = this.createSeparator(terminalWidth);
    const helpText = this.renderHelpText();

    this.terminal.moveCursor(terminalHeight - 1, 0);
    this.terminal.writeLine(separator);
    this.terminal.writeLine(helpText);
  }

  private createSeparator(width: number): string {
    const line = '─'.repeat(width);
    return `${ANSI.DIM}${line}${ANSI.RESET}`;
  }

  private renderCompactMode(
    tasks: Task[],
    selectedIndex: number,
    stats: TaskStats
  ): void {
    // Minimal rendering for very small terminals
    // Skip separator, inline help with stats
    this.terminal.writeLine(
      `${stats.completed}/${stats.total} • q:quit ↑↓:move spc:toggle a:add`
    );
    this.renderTaskList(tasks, selectedIndex);
  }
}
```

### Task List Scrolling

`src/ui/task-list-view.ts`

```typescript
export class TaskListView {
  private scrollOffset: number = 0;

  getVisibleTasks(maxVisible: number): Task[] {
    return this.tasks.slice(this.scrollOffset, this.scrollOffset + maxVisible);
  }

  adjustScrollToSelection(maxVisible: number): void {
    // Ensure selected task is visible
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + maxVisible) {
      this.scrollOffset = this.selectedIndex - maxVisible + 1;
    }
  }

  getScrollIndicator(): { hasMore: boolean; position: string } {
    const hasMore = this.scrollOffset + maxVisible < this.tasks.length;
    const position = `${this.scrollOffset + 1}-${Math.min(
      this.scrollOffset + maxVisible,
      this.tasks.length
    )}/${this.tasks.length}`;
    return { hasMore, position };
  }
}
```

## Edge Cases

### Small Terminals (< 12 rows)

Compact mode: inline help with stats, skip separator

### Terminal Resize

Listen for SIGWINCH and re-render with new dimensions

### Modal Overlays

Modal appears above footer (footer stays visible)

### Long Help Text

Truncate with ellipsis or use abbreviations for narrow terminals

## Implementation Order

1. Add terminal dimension methods to Terminal class
2. Create LayoutCalculator utility
3. Update Renderer with sticky footer logic
4. Add compact mode for small terminals
5. Implement terminal resize handling
