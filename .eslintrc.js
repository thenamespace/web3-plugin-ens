module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  rules: {
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],
    '@typescript-eslint/no-explicit-any': 'error',
  },
  ignorePatterns: ['src/tracer.js'],
}
