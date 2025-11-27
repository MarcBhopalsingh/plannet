#!/usr/bin/env node

import { run } from './app.js';

// Bootstrap the CLI
run().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
