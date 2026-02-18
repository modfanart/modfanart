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

// Helper function to run a command and return its output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`${colors.red}Error running command: ${command}${colors.reset}`);
    console.error(error.stdout || error.message);
    return error.stdout || error.message;
  }
}

// Check if package.json has all required dependencies
function checkDependencies() {
  console.log(`${colors.blue}Checking dependencies...${colors.reset}`);

  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const devDependencies = packageJson.devDependencies || {};

  const requiredDeps = [
    'eslint',
    'prettier',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint-config-prettier',
    'husky',
    'lint-staged',
  ];

  const missingDeps = requiredDeps.filter((dep) => !devDependencies[dep]);

  if (missingDeps.length > 0) {
    console.log(`${colors.yellow}Missing dependencies: ${missingDeps.join(', ')}${colors.reset}`);
    console.log(`${colors.yellow}Installing missing dependencies...${colors.reset}`);
    runCommand(`npm install --save-dev ${missingDeps.join(' ')}`);
    console.log(`${colors.green}Dependencies installed successfully!${colors.reset}`);
  } else {
    console.log(`${colors.green}All dependencies are installed!${colors.reset}`);
  }
}

// Run ESLint
function runEslint() {
  console.log(`${colors.blue}Running ESLint...${colors.reset}`);
  const eslintOutput = runCommand('npx eslint --ext .js,.jsx,.ts,.tsx .');

  if (eslintOutput.includes('error')) {
    console.log(
      `${colors.red}ESLint found errors. Run 'npm run lint:fix' to fix them.${colors.reset}`
    );
  } else {
    console.log(`${colors.green}ESLint passed!${colors.reset}`);
  }
}

// Run Prettier
function runPrettier() {
  console.log(`${colors.blue}Checking formatting with Prettier...${colors.reset}`);
  const prettierOutput = runCommand('npx prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"');

  if (prettierOutput.includes('Code style issues')) {
    console.log(
      `${colors.yellow}Prettier found formatting issues. Running formatter...${colors.reset}`
    );
    runCommand('npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"');
    console.log(`${colors.green}Formatting complete!${colors.reset}`);
  } else {
    console.log(`${colors.green}Prettier check passed!${colors.reset}`);
  }
}

// Run TypeScript type checking
function runTypeCheck() {
  console.log(`${colors.blue}Running TypeScript type checking...${colors.reset}`);
  const typeCheckOutput = runCommand('npx tsc --noEmit');

  if (typeCheckOutput.includes('error TS')) {
    console.log(`${colors.red}TypeScript found type errors. Please fix them.${colors.reset}`);
  } else {
    console.log(`${colors.green}TypeScript check passed!${colors.reset}`);
  }
}

// Main function
function main() {
  console.log(`${colors.magenta}Starting code quality checks...${colors.reset}`);

  checkDependencies();
  runEslint();
  runPrettier();
  runTypeCheck();

  console.log(`${colors.magenta}Code quality checks completed!${colors.reset}`);
}

main();
