#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}Starting MOD Platform restoration process...${colors.reset}`);

// Step 1: Check if .next directory exists and remove it
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log(`${colors.yellow}Removing Next.js cache (.next directory)...${colors.reset}`);
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log(`${colors.green}Successfully removed Next.js cache.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to remove Next.js cache:${colors.reset}`, error);
  }
} else {
  console.log(`${colors.blue}No Next.js cache found, skipping removal.${colors.reset}`);
}

// Step 2: Clear npm cache
console.log(`${colors.yellow}Clearing npm cache...${colors.reset}`);
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log(`${colors.green}Successfully cleared npm cache.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to clear npm cache:${colors.reset}`, error);
}

// Step 3: Reinstall dependencies
console.log(`${colors.yellow}Reinstalling dependencies...${colors.reset}`);
try {
  execSync('npm ci', { stdio: 'inherit' });
  console.log(`${colors.green}Successfully reinstalled dependencies.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to reinstall dependencies:${colors.reset}`, error);
  console.log(`${colors.yellow}Trying npm install instead...${colors.reset}`);
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log(`${colors.green}Successfully installed dependencies.${colors.reset}`);
  } catch (installError) {
    console.error(`${colors.red}Failed to install dependencies:${colors.reset}`, installError);
  }
}

// Step 4: Build the project
console.log(`${colors.yellow}Building the project...${colors.reset}`);
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}Successfully built the project.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to build the project:${colors.reset}`, error);
}

console.log(`${colors.cyan}Restoration process completed.${colors.reset}`);
console.log(
  `${colors.green}You can now start the development server with: npm run dev${colors.reset}`
);
