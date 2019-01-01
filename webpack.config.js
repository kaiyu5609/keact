var path = require('path')

var config = {
	// mode: 'development',
	entry: [
		path.resolve(__dirname, './src/index.js')
	],
	output: {
		path: path.resolve(__dirname, 'release/'),
		filename: 'kreact.js',
		publicPath: 'release',
		library: 'kreact',
		libraryTarget: 'umd'
	},
	devtool: 'source-map',
	module: {
		rules: [
			{test: /\.css$/, use: 'style!css'},
			{
				test: /\.js$/,
				exclude: [/node_modules/],
				use: [{
					loader: 'babel-loader',
					options: {
						presets: ['es2015']
					}
				}]
			}
		]
	},
	resolve: {
		extensions: ['.js', '.css']
	}
}

module.exports = config;
