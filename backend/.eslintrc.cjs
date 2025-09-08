module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module', ecmaVersion: 'latest' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist/**'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
