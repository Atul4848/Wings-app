module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'mocha',
  ],
  extends: [
    '../apps/host/.eslintrc.js',
  ],
};
