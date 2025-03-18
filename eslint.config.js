import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
	{
		ignores: ['node_modules/**', 'dist/**'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		plugins: {
			prettier: prettier,
		},
		rules: {
			'prettier/prettier': 'error',
			'no-console': 'off',
			'indent': ['error', 'tab', { 'SwitchCase': 1 }],
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: {
				node: 'readonly',
				jest: 'readonly',
			},
		},
	},
	// Special rules for test files
	{
		files: ['**/*.test.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
		},
	},
	// Configuration specifically for jest.config.js and other config files
	{
		files: ['jest.config.js', '*.config.js', '.*.js'],
		rules: {
			'semi': 'off',
			'prettier/prettier': 'off', // Disable prettier for config files
		},
	},
	// Additional configuration for scripts directory
	{
		files: ['scripts/**/*.js'],
		languageOptions: {
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				require: 'readonly',
				module: 'readonly',
			},
		},
	},
	eslintConfigPrettier,
)
