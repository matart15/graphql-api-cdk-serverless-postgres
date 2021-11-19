module.exports = {
  'lib/**/*.ts': ['eslint --fix', 'git add'],
  'bin/**/*.tsx': ['eslint --fix', 'git add'],
  'src/**/*.ts': [
    'eslint -c .eslintrc.functions.js --quiet --fix',
  ],
};
