#!/usr/bin/env node

import { run } from './app.js';

// Parse command line arguments
const args = process.argv.slice(2);
const isInteractive = args.includes('-i');

// Bootstrap the CLI
if (isInteractive) {
  run().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
} else {
  console.log('hello world');
  process.exit(0);
}
