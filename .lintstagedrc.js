module.exports = {
  'lib/**/*.ts': ['eslint --fix', 'git add'],
  'bin/**/*.tsx': ['eslint --fix', 'git add'],
  'src/**/*.ts': [
    'eslint -c src/.eslintrc.js --quiet --fix',
  ],
};
