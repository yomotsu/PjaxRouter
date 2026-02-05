import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const license = `/*!
 * PjaxRouter v2.0.0
 * https://github.com/yomotsu/PjaxRouter
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */`;

export default [
	// UMD build (for browsers via <script>)
	{
		input: 'src/PjaxRouter.ts',
		output: {
			format: 'umd',
			name: 'PjaxRouter',
			file: 'dist/PjaxRouter.js',
			banner: license,
			sourcemap: true,
			indent: '\t',
		},
		plugins: [
			typescript( {
				tsconfig: './tsconfig.json',
				declaration: false, // Only generate .d.ts in ES module build
			} ),
		],
	},
	// UMD minified
	{
		input: 'src/PjaxRouter.ts',
		output: {
			format: 'umd',
			name: 'PjaxRouter',
			file: 'dist/PjaxRouter.min.js',
			banner: license,
			sourcemap: true,
		},
		plugins: [
			typescript( {
				tsconfig: './tsconfig.json',
				declaration: false,
			} ),
			terser(),
		],
	},
	// ES module (for bundlers)
	{
		input: 'src/PjaxRouter.ts',
		output: {
			format: 'es',
			file: 'dist/PjaxRouter.module.js',
			banner: license,
			sourcemap: true,
			indent: '\t',
		},
		plugins: [
			typescript( {
				tsconfig: './tsconfig.json',
				declaration: true, // Generate .d.ts files
				declarationDir: './dist',
			} ),
		],
	},
];
