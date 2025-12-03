import * as readline from 'readline';

export interface Keybind {
  key: string;
  action: string;
  match: (key: readline.Key) => boolean;
}
