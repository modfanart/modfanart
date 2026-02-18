// eslint.config.mjs   (recommended extension for ESM + import.meta)
import js from '@eslint/js';
import globals from 'globals';

import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

import importPlugin from 'eslint-plugin-import';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-plugin-prettier';

// ────────────────────────────────────────────────────────────

export default [
  // 1. Base JS rules
  js.configs.recommended,

  // 2. Globals (browser + node)
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 3. React + Hooks + a11y
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

      'react/react-in-jsx-scope': 'off', // new JSX transform
      'react/prop-types': 'off', // using TS
      'react/jsx-uses-react': 'off', // new JSX transform
    },
  },

  // 4. ──── Improved import handling ────────────────────────────────────────
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true, // ← critical for @/ aliases + .ts/.tsx
          project: './tsconfig.json',
        },
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/extensions': ['error', 'never', { ignorePackages: true }],

      'import/order': [
        'error', // ← change to 'error' once stable
        {
          groups: [
            'builtin', // node: fs, path, ...
            'external', // npm packages
            ['internal', 'parent', 'sibling', 'index'], // your code
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  // 5. Next.js rules
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'warn', // ← you have many <img>
    },
  },

  // 6. TypeScript (only on .ts/.tsx)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true, // ← modern way (infers from nearest tsconfig)
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...ts.configs['recommended-type-checked'].rules,

      // Keep strict, but downgrade noisy unsafe rules during cleanup
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Very helpful during heavy API/DB refactoring
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // Common React + async pain points — make them less painful
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } }, // allows async onClick / onSubmit
      ],
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  // 7. Prettier (last – overrides formatting)
  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },

  // 8. Jest / tests (if you use them)
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: globals.jest,
    },
  },

  // 9. Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'public/**',
      'coverage/**',
      '**/*.min.*',
      'next-env.d.ts',
      '**/*.config.*', // optional: ignore eslint.config.mjs itself if noisy
    ],
  },
];
