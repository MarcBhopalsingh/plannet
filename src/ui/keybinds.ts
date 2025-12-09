import * as readline from 'readline';
import { Keybind } from '@plannet/io';

export const KEYBINDS: Record<string, Keybind> = {
  QUIT: {
    key: 'q',
    action: 'quit',
    match: (key: readline.Key) => key.name === 'q' || (key.name === 'c' && key.ctrl === true),
  },
  MOVE_UP: {
    key: '↑/k',
    action: 'up',
    match: (key: readline.Key) => key.name === 'up' || (key.name === 'k' && !key.ctrl),
  },
  MOVE_DOWN: {
    key: '↓/j',
    action: 'down',
    match: (key: readline.Key) => key.name === 'down' || (key.name === 'j' && !key.ctrl),
  },
  TOGGLE: {
    key: '␣',
    action: 'toggle',
    match: (key: readline.Key) => key.name === 'space',
  },
  ADD: {
    key: 'a',
    action: 'add',
    match: (key: readline.Key) => key.name === 'a' && !key.ctrl,
  },
  EDIT: {
    key: 'e',
    action: 'edit',
    match: (key: readline.Key) => key.name === 'e' && !key.ctrl,
  },
  DELETE: {
    key: 'd',
    action: 'delete',
    match: (key: readline.Key) => key.name === 'd' && !key.ctrl,
  },
  SORT: {
    key: 's',
    action: 'sort',
    match: (key: readline.Key) => key.name === 's' && !key.ctrl,
  },
  ADD_PROJECT: {
    key: 'p',
    action: 'project',
    match: (key: readline.Key) => key.name === 'p' && !key.ctrl,
  },
  MOVE_TO_PROJECT: {
    key: 'm',
    action: 'move',
    match: (key: readline.Key) => key.name === 'm' && !key.ctrl,
  },
  NEXT_PROJECT: {
    key: '⇥',
    action: 'next',
    match: (key: readline.Key) => key.name === 'tab',
  },
  TOGGLE_FOLD: {
    key: 'f',
    action: 'fold',
    match: (key: readline.Key) => key.name === 'f' && !key.ctrl && !key.shift,
  },
  TOGGLE_FOLD_ALL: {
    key: 'F',
    action: 'fold all',
    match: (key: readline.Key) => key.name === 'f' && key.shift === true,
  },
};
