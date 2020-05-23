const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const dist = path.resolve(__dirname, 'dist')

module.exports = {
  entry: './src/main.ts',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        use: [{
          loader: 'ts-loader',
          options: {
            // // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
            // happyPackMode: true
            onlyCompileBundledFiles: true
          }
        }],

      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: dist,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: dist+'/assets' },
      ],
    }),
  ]
};
