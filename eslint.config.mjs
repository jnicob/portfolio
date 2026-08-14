import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '**/.next/',
      '**/out/',
      '**/dist/',
      '**/coverage/',
      '.superpowers/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    files: ['apps/web/src/components/showcase/**/*.{ts,tsx}'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  prettier,
);
