const tslintConfigRules = {
  deprecation: true,
  'no-duplicate-imports': true,
  'no-duplicate-variable': [true, 'check-parameters'],
  'no-floating-promises': true,
  'no-implicit-dependencies': [true, ['@lib']],
  // 'no-import-side-effect': true,
  'no-shadowed-variable': true,
  'no-void-expression': [true, 'ignore-arrow-function-shorthand'],
  'trailing-comma': true,
  'triple-equals': true,
};

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    createDefaultProgram: true,
  },
  globals: {
    document: true,
    window: true,
    location: true,
    console: true,
    modeule: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        // this loads <rootdir>/tsconfig.json to eslint
      },
    },
  },
  env: {
    'jest/globals': true,
    node: true,
  },
  plugins: [
    '@typescript-eslint',
    '@typescript-eslint/tslint',
    'jest',
    'import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-new': 'off',
    'no-undef': 'error',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': ['error'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'import/no-unused-modules': [1, { unusedExports: true }],
    'max-lines': ['error', 300],
    'import/no-default-export': ['error'],
    // note you must disable the base rule as it can report incorrect errors
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-restricted-imports': ['error', { patterns: ['../'] }],
    '@typescript-eslint/no-empty-function': 0,
    'no-underscore-dangle': 'off',
    '@typescript-eslint/tslint/config': [
      'error',
      {
        rules: tslintConfigRules,
      },
    ],
  },
  overrides: [
    {
      files: ['cli.ts', 'subcommans'],
      rules: {
        '@typescript-eslint/tslint/config': [
          'error',
          {
            rules: {
              ...tslintConfigRules,
              'no-implicit-dependencies': false,
            },
          },
        ],
      },
    },
  ],
};
