import * as path from 'path'
import * as webpack from "webpack";
import 'webpack-dev-server';
import {Configuration as WebpackConfiguration} from "webpack";
import {Configuration as WebpackDevServerConfiguration} from 'webpack-dev-server';
import WebpackBaseConfiguration from "./webpack.base.config";

const HtmlWebpackPlugin = require('html-webpack-plugin');

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  mode: 'development',
  entry: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'example/src')],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'example/public/index.html'),
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
  },
  devServer: {
    static: path.resolve(__dirname, 'dist')
  },
  ...WebpackBaseConfiguration
};

export default config;
