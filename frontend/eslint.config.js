import js from '@eslint/js';
import globals from 'globals';

import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-plugin-prettier';

export default [
  // Base JS rules
  js.configs.recommended,

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // React + Accessibility + Hooks (flat compatible)
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // Import plugin
  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/extensions': ['error', 'never'],
    },
  },

  // Next.js
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },

  // TypeScript
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-type-checked'].rules,

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Prettier
  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Tests
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: globals.jest,
    },
  },

  // Ignore files
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'public/**'],
  },
];
