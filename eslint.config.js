import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	{
		files: ['**/*.ts'],
		plugins: { '@typescript-eslint': tsPlugin },
		languageOptions: { parser: tsParser },
		rules: {
			...tsPlugin.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	},
	{
		files: ['**/*.svelte'],
		plugins: { '@typescript-eslint': tsPlugin },
		languageOptions: {
			parserOptions: { parser: tsParser }
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	},
	{
		rules: {
			// Standard <a href> links in SvelteKit don't need resolve()
			'svelte/no-navigation-without-resolve': 'off',
			// Too strict for a home app with MongoDB dynamic data
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**']
	}
];
