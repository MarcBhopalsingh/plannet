export type Task = string;

export type Command =
  | 'interactive'
  | 'i'
  | 'list'
  | 'ls'
  | 'add'
  | 'a'
  | 'default'
  | 'help';

export interface KeyEvent {
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  sequence?: string;
}
