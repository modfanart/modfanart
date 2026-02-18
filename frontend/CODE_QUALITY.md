# Code Quality Guidelines

This document outlines the code quality standards and tools used in the MOD Platform project.

## TypeScript Configuration

We use a strict TypeScript configuration to catch potential runtime errors during development. Our `tsconfig.json` includes:

- `strict: true`: Enables all strict type checking options
- `noImplicitAny`: Raises errors on expressions and declarations with an implied 'any' type
- `strictNullChecks`: Makes handling of null and undefined more explicit
- `noUncheckedIndexedAccess`: Adds undefined to any indexed access like array[index]
- And many more strict checks

## ESLint Configuration

Our ESLint setup enforces code quality rules and best practices:

- TypeScript-specific rules
- React and React Hooks best practices
- Accessibility (a11y) requirements
- Import order and organization
- Security best practices
- Code complexity limits

## Prettier Configuration

We use Prettier to ensure consistent code formatting across the codebase:

- Single quotes for strings
- 2 spaces for indentation
- 100 character line length
- Trailing commas in objects and arrays
- No semicolons

## Pre-commit Hooks

We use Husky and lint-staged to run checks before each commit:

- ESLint to catch code quality issues
- Prettier to ensure consistent formatting
- TypeScript type checking to catch type errors

## Running Quality Checks

You can run the following npm scripts:

- `npm run lint`: Run ESLint to check for issues
- `npm run lint:fix`: Run ESLint and automatically fix issues where possible
- `npm run format`: Run Prettier to format all files
- `npm run format:check`: Check if files are properly formatted
- `npm run type-check`: Run TypeScript compiler to check for type errors
- `npm run validate`: Run all checks (lint, format, type-check)

## VS Code Integration

We recommend using VS Code with the following extensions:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

Our workspace settings will automatically format code on save and run ESLint fixes.

## Continuous Integration

These checks are also run in our CI pipeline to ensure code quality is maintained across all contributions.
