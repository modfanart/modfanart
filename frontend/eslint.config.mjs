// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';

import tseslint from 'typescript-eslint';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

import importPlugin from 'eslint-plugin-import';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-plugin-prettier';

// ────────────────────────────────────────────────────────────

export default [
  // 1. Base JS
  js.configs.recommended,

  // 2. Globals
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 3. React
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
      'react/jsx-uses-react': 'off',
    },
  },

  // 4. Imports
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/first': 'error',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
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
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  // 5. Next.js
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'warn',
    },
  },

  // 6. TypeScript (FIXED PROPERLY)
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...config.rules,

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
    },
  })),

  // 7. Prettier
  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },

  // 8. Tests
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: globals.jest,
    },
  },

  // 9. Ignore
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
    ],
  },
];