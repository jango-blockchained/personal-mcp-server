import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		plugins: {
			prettier: prettier,
		},
		rules: {
			'no-console': 'off',
			'prettier/prettier': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
		ignores: ['dist/**', 'node_modules/**'],
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
];
