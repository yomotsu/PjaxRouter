import babel from 'rollup-plugin-babel'

const license = `/*!
 * PjaxRouter
 * https://github.com/yomotsu/PjaxRouter
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */`

export default {
	entry: 'src/PjaxRouter.js',
	indent: '\t',
	sourceMap: false,
	plugins: [
		babel( {
			exclude: 'node_modules/**',
			presets: [
				[ 'env', {
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
	],
	targets: [
		{
			format: 'umd',
			moduleName: 'PjaxRouter',
			dest: 'dist/PjaxRouter.js',
			banner: license
		},
		{
			format: 'es',
			dest: 'dist/PjaxRouter.module.js',
			banner: license
		}
	]
};
