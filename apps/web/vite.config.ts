import { defineConfig } from 'vite';

/**
 * Lightweight Vite profile used for isolated component previews (Storybook-style)
 * when the full Next.js stack is unnecessary or still compiling.
 */
export default defineConfig({
	plugins: [],
	server: {
		port: 5173,
		open: true,
	},
	build: {
		outDir: 'dist-preview',
		sourcemap: true,
	},
	resolve: {
		alias: {
			'@': '/src',
		},
	},
});

