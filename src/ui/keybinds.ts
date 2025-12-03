import * as readline from 'readline';
import { Keybind } from '@plannet/io';

export const KEYBINDS: Record<string, Keybind> = {
  QUIT: {
    description: 'q: quit',
    match: (key: readline.Key) =>
      key.name === 'q' || (key.name === 'c' && key.ctrl === true),
  },
  MOVE_UP: {
    description: '↑/k: move up',
    match: (key: readline.Key) =>
      key.name === 'up' || (key.name === 'k' && !key.ctrl),
  },
  MOVE_DOWN: {
    description: '↓/j: move down',
    match: (key: readline.Key) =>
      key.name === 'down' || (key.name === 'j' && !key.ctrl),
  },
  TOGGLE: {
    description: 'space: toggle',
    match: (key: readline.Key) => key.name === 'space',
  },
  ADD: {
    description: 'a: add',
    match: (key: readline.Key) => key.name === 'a' && !key.ctrl,
  },
  EDIT: {
    description: 'e: edit',
    match: (key: readline.Key) => key.name === 'e' && !key.ctrl,
  },
};
