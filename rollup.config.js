import babel from 'rollup-plugin-babel';

const license = `/*!
 * PjaxRouter
 * https://github.com/yomotsu/PjaxRouter
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */`;

export default {
	input: 'src/PjaxRouter.js',
	output: [
		{
			format: 'umd',
			name: 'PjaxRouter',
			file: 'dist/PjaxRouter.js',
			banner: license
		},
		{
			format: 'es',
			file: 'dist/PjaxRouter.module.js',
			banner: license
		}
	],
	indent: '\t',
	sourceMap: false,
	plugins: [
		babel( {
			exclude: 'node_modules/**',
			presets: [
				[ '@babel/preset-env', {
					targets: {
						browsers: [
							'last 2 versions',
							'ie >= 9'
						]
					},
					loose: true,
					modules: false
				} ]
			]
		} )
	]
};
