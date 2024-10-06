import teslint from 'typescript-eslint';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['lib'] },
  eslint.configs.recommended,
  ...teslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['*.js', '*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
