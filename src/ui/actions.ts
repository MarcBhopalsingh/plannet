import { Task } from '@plannet/tasks';
import { ProjectView } from './project-view';
import { KEYBINDS } from './keybinds';
import { Keybind } from '@plannet/io';

interface Action {
  keybind: Keybind;
  rerender: boolean;
  execute: () => void | Promise<void>;
}

export class ActionRegistry {
  private readonly actions: Action[];

  constructor(
    private readonly view: ProjectView,
    private readonly prompt: (initial?: string) => Promise<string | null>,
    private readonly quit: () => void
  ) {
    this.actions = this.defineActions();
  }

  async execute(key: { name?: string; ctrl?: boolean }): Promise<boolean> {
    const action = this.actions.find((a) => a.keybind.match(key));
    if (!action) return false;

    try {
      await action.execute();
    } catch (error) {
      console.error('Action failed:', error);
    }
    return action.rerender;
  }

  private defineActions(): Action[] {
    return [
      { keybind: KEYBINDS.QUIT, rerender: false, execute: () => this.quit() },
      {
        keybind: KEYBINDS.MOVE_UP,
        rerender: true,
        execute: () => this.view.moveUp(),
      },
      {
        keybind: KEYBINDS.MOVE_DOWN,
        rerender: true,
        execute: () => this.view.moveDown(),
      },
      {
        keybind: KEYBINDS.TOGGLE,
        rerender: true,
        execute: () => this.view.toggleSelectedTask(),
      },
      {
        keybind: KEYBINDS.DELETE,
        rerender: true,
        execute: () => this.view.deleteSelectedTask(),
      },
      {
        keybind: KEYBINDS.SORT,
        rerender: true,
        execute: () => this.view.sortByCompletion(),
      },
      {
        keybind: KEYBINDS.ADD,
        rerender: true,
        execute: async () => {
          const input = await this.prompt();
          if (input) this.view.addTask(new Task(input));
        },
      },
      {
        keybind: KEYBINDS.EDIT,
        rerender: true,
        execute: async () => {
          const task = this.view.getSelectedTask();
          if (!task) return;
          const input = await this.prompt(task.description);
          if (input) this.view.updateSelectedTask(input);
        },
      },
    ];
  }
}

