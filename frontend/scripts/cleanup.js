const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

console.log(`${colors.yellow}Starting cleanup process...${colors.reset}`);

// Function to execute commands and handle errors
function runCommand(command, errorMessage) {
  try {
    console.log(`${colors.cyan}Running: ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}${errorMessage}: ${error.message}${colors.reset}`);
    return false;
  }
}

// Step 1: Remove node_modules and package-lock.json
console.log(
  `${colors.yellow}Step 1: Removing node_modules and package-lock.json...${colors.reset}`
);
try {
  if (fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    fs.rmSync(path.join(process.cwd(), 'node_modules'), { recursive: true, force: true });
    console.log(`${colors.green}Successfully removed node_modules${colors.reset}`);
  } else {
    console.log(`${colors.blue}node_modules directory doesn't exist, skipping...${colors.reset}`);
  }

  if (fs.existsSync(path.join(process.cwd(), 'package-lock.json'))) {
    fs.unlinkSync(path.join(process.cwd(), 'package-lock.json'));
    console.log(`${colors.green}Successfully removed package-lock.json${colors.reset}`);
  } else {
    console.log(`${colors.blue}package-lock.json doesn't exist, skipping...${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error removing files: ${error.message}${colors.reset}`);
}

// Step 2: Remove .next directory
console.log(`${colors.yellow}Step 2: Removing .next directory...${colors.reset}`);
try {
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    fs.rmSync(path.join(process.cwd(), '.next'), { recursive: true, force: true });
    console.log(`${colors.green}Successfully removed .next directory${colors.reset}`);
  } else {
    console.log(`${colors.blue}.next directory doesn't exist, skipping...${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error removing .next directory: ${error.message}${colors.reset}`);
}

// Step 3: Clear npm cache
console.log(`${colors.yellow}Step 3: Clearing npm cache...${colors.reset}`);
runCommand('npm cache clean --force', 'Error clearing npm cache');

// Step 4: Install dependencies
console.log(`${colors.yellow}Step 4: Installing dependencies...${colors.reset}`);
runCommand('npm install', 'Error installing dependencies');

console.log(`${colors.green}Cleanup process completed!${colors.reset}`);
console.log(`${colors.magenta}Next steps:${colors.reset}`);
console.log(`${colors.magenta}1. Run 'npm run dev' to start the development server${colors.reset}`);
console.log(`${colors.magenta}2. Check if the JSX transform error is resolved${colors.reset}`);
