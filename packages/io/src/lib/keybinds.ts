import * as readline from 'readline';

export interface Keybind {
  description: string;
  match: (key: readline.Key) => boolean;
}
