import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
	// Module build
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/index.mjs',
				format: 'es',
			},
			{
				file: 'dist/index.cjs',
				format: 'cjs',
				exports: 'named',
			},
		],
		plugins: [
			typescript({
				tsconfig: './tsconfig.json',
				declaration: true,
				declarationDir: './dist/types',
			}),
			resolve(),
			commonjs(),
			terser(),
		],
	},
	// Window injection build
	{
		input: 'src/window-inject.ts',
		output: {
			file: 'dist/index.window.js',
			format: 'iife',
			name: 'veroTracking',
		},
		plugins: [
			typescript({
				tsconfig: './tsconfig.json',
			}),
			resolve(),
			commonjs(),
			terser(),
		],
	},
	// Type definitions bundle
	{
		input: './dist/types/src/index.d.ts',
		output: {
			file: 'dist/index.d.ts',
			format: 'es',
		},
		plugins: [dts()],
	},
];
