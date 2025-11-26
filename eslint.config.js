import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'tmp', 'website/.vitepress'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}', 'test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'indent': [
        'error',
        2,
        {
          'offsetTernaryExpressions': true,
          'SwitchCase': 1
        }
      ],
      'linebreak-style': [
        'error',
        'unix'
      ],
      'quotes': [
        'warn',
        'single',
        {
          'avoidEscape': true,
          'allowTemplateLiterals': true
        }
      ],
      'semi': [
        'error',
        'never'
      ]
    },
  },
)
