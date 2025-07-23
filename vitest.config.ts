import path from 'path';
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: 'node'
	},
	resolve: {
		dedupe: [],
		alias: {
			'@': path.resolve(__dirname, './src'),
			'rpg/': path.resolve(__dirname, './rpg'),
		},
	},
});