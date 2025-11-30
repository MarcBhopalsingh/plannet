import * as readline from 'readline';

export class TextInput {
  async collect(onUpdate: (input: string) => void): Promise<string | null> {
    let input = '';

    return new Promise((resolve) => {
      onUpdate(input);

      const listener = (str: string, key: readline.Key) => {
        if (key.name === 'return') {
          cleanup();
          resolve(input.trim() || null);
        } else if (key.name === 'escape') {
          cleanup();
          resolve(null);
        } else if (key.name === 'backspace') {
          input = input.slice(0, -1);
          onUpdate(input);
        } else if (str && !key.ctrl && !key.meta) {
          input += str;
          onUpdate(input);
        }
      };

      const cleanup = () => {
        process.stdin.removeListener('keypress', listener);
      };

      process.stdin.on('keypress', listener);
    });
  }
}

