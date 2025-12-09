import { Task } from '@plannet/tasks';
import { WorkspaceView } from './workspace-view';
import { KEYBINDS } from './keybinds';
import { Keybind } from '@plannet/io';
import { StatusType } from './formatters';

interface Action {
  keybind: Keybind;
  rerender: boolean;
  execute: () => void | Promise<void>;
}

export type StatusCallback = (message: string, type?: StatusType) => void;
export type AddProjectCallback = (name: string) => Promise<void>;

export class ActionRegistry {
  private readonly actions: Action[];

  constructor(
    private readonly workspace: WorkspaceView,
    private readonly prompt: (initial?: string) => Promise<string | null>,
    private readonly quit: () => void,
    private readonly showStatus: StatusCallback = () => {},
    private readonly addProject: AddProjectCallback = async () => {}
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
        execute: () => this.workspace.moveUp(),
      },
      {
        keybind: KEYBINDS.MOVE_DOWN,
        rerender: true,
        execute: () => this.workspace.moveDown(),
      },
      {
        keybind: KEYBINDS.TOGGLE,
        rerender: true,
        execute: () => {
          const task = this.workspace.getSelectedTask();
          this.workspace.toggleSelectedTask();
          if (task) {
            const message = task.completed ? 'Task completed!' : 'Task uncompleted';
            const type = task.completed ? 'success' : 'info';
            this.showStatus(message, type);
          }
        },
      },
      {
        keybind: KEYBINDS.DELETE,
        rerender: true,
        execute: () => {
          this.workspace.deleteSelectedTask();
          this.showStatus('Task deleted', 'warning');
        },
      },
      {
        keybind: KEYBINDS.SORT,
        rerender: true,
        execute: () => {
          this.workspace.sortByCompletion();
          this.showStatus('Sorted by completion', 'info');
        },
      },
      {
        keybind: KEYBINDS.ADD,
        rerender: true,
        execute: async () => {
          const input = await this.prompt();
          if (input) {
            this.workspace.addTask(new Task(input));
            this.showStatus('Task added', 'success');
          }
        },
      },
      {
        keybind: KEYBINDS.EDIT,
        rerender: true,
        execute: async () => {
          const task = this.workspace.getSelectedTask();
          if (!task) return;
          const input = await this.prompt(task.description);
          if (input) {
            this.workspace.updateSelectedTask(input);
            this.showStatus('Task updated', 'success');
          }
        },
      },
      {
        keybind: KEYBINDS.ADD_PROJECT,
        rerender: true,
        execute: async () => {
          const input = await this.prompt();
          if (input) {
            await this.addProject(input);
            this.showStatus('Project added', 'success');
          }
        },
      },
      {
        keybind: KEYBINDS.MOVE_TO_PROJECT,
        rerender: true,
        execute: () => {
          const moved = this.workspace.moveSelectedTaskToNextProject();
          if (moved) {
            this.showStatus('Task moved to next project', 'info');
          } else {
            this.showStatus('No task to move', 'warning');
          }
        },
      },
      {
        keybind: KEYBINDS.NEXT_PROJECT,
        rerender: true,
        execute: () => this.workspace.nextProject(),
      },
      {
        keybind: KEYBINDS.TOGGLE_FOLD,
        rerender: true,
        execute: () => this.workspace.toggleFoldActiveProject(),
      },
      {
        keybind: KEYBINDS.TOGGLE_FOLD_ALL,
        rerender: true,
        execute: () => this.workspace.toggleFoldAll(),
      },
    ];
  }
}
