import { InputManager, InputHandler } from './input-manager';

export interface TextPromptOptions {
  initialValue?: string;
  onUpdate?: (value: string) => void;
}

export class TextPrompt {
  constructor(private readonly inputManager: InputManager) {}

  prompt(options: TextPromptOptions = {}): Promise<string | null> {
    const { initialValue = '', onUpdate } = options;

    return new Promise((resolve) => {
      let input = initialValue;
      onUpdate?.(input);

      const handler: InputHandler = (str, key) => {
        if (key.name === 'return') {
          resolve(input.trim() || null);
        } else if (key.name === 'escape' || (key.name === 'c' && key.ctrl)) {
          resolve(null);
        } else if (key.name === 'backspace') {
          input = input.slice(0, -1);
          onUpdate?.(input);
        } else if (str && !key.ctrl && !key.meta) {
          input += str;
          onUpdate?.(input);
        }
      };

      this.inputManager.setHandler(handler);
    });
  }
}

