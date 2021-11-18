module.exports = {
  'src/**/*.js': ['eslint --fix', 'git add'],
  'src/**/*.jsx': ['eslint --fix', 'git add'],
  'src/**/*.ts': ['eslint --fix', 'git add'],
  'src/**/*.tsx': ['eslint --fix', 'git add'],
  'amplify/backend/function/**/*.ts': [
    'eslint -c .eslintrc.function.js --no-eslintrc --quiet --fix',
  ],
};
