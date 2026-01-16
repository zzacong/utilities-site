import { tanstackConfig } from '@tanstack/eslint-config'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...tanstackConfig,

  globalIgnores(['.output/']),

  // ✅ JS config files: no TS project
  {
    files: ['*.config.js', '*.config.cjs', '*.config.mjs'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
    rules: {
      // Disable *all* rules that require type info
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/array-type': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
    },
  },
])
