var path = require('path');

module.exports = {
  entry: {
    index: [path.resolve(__dirname, 'src/index.ts')]
  },
  output: {
    library: true,
    libraryTarget: 'commonjs2',
    filename: path.resolve(__dirname, 'lib/[name].js')  
  },
  target: 'node',
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.ts(x?)$/,
        loader: 'babel-loader!ts-loader'
      }
    ]
  }
}
