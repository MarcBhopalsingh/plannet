#!/usr/bin/env node

import { appendFile, readFile } from 'fs/promises';
import { run } from './app.js';

// Parse command line arguments
const args = process.argv.slice(2);
const isInteractive = args.includes('-i');
const listTasks = args.includes('-l');
const addIndex = args.indexOf('-a');

// Bootstrap the CLI
if (isInteractive) {
  // Read and print the contents of tasks.txt, then start interactive mode
  readFile('tasks.txt', 'utf-8')
    .then((content) => {
      process.stdout.write(content);
      // Start interactive mode after listing tasks
      return run();
    })
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, just start interactive mode
        run()
          .then(() => {
            process.exit(0);
          })
          .catch((runError) => {
            console.error('Error:', runError.message);
            process.exit(1);
          });
      } else {
        console.error('Error reading tasks.txt:', error.message);
        process.exit(1);
      }
    });
} else if (listTasks) {
  // Read and print the contents of tasks.txt
  readFile('tasks.txt', 'utf-8')
    .then((content) => {
      process.stdout.write(content);
      process.exit(0);
    })
    .catch((error) => {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, print nothing or a message
        process.exit(0);
      } else {
        console.error('Error reading tasks.txt:', error.message);
        process.exit(1);
      }
    });
} else if (addIndex !== -1) {
  // Get everything after the -a flag
  const taskText = args.slice(addIndex + 1).join(' ');
  appendFile('tasks.txt', taskText + '\n')
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error writing to tasks.txt:', error.message);
      process.exit(1);
    });
} else {
  console.log('hello world');
  process.exit(0);
}
