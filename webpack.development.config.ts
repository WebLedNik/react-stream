import * as path from 'path'
import * as webpack from "webpack";
import 'webpack-dev-server';
import {Configuration as WebpackConfiguration} from "webpack";
import {Configuration as WebpackDevServerConfiguration} from 'webpack-dev-server';
import WebpackBaseConfiguration from "../webpack.base.config";

const HtmlWebpackPlugin = require('html-webpack-plugin');

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  mode: 'development',
  entry: [path.resolve(__dirname, 'src/index.tsx'), path.resolve(__dirname, '../src')],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'src/dist'),
    clean: true,
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
  },
  devServer: {
    static: path.resolve(__dirname, 'src/dist')
  },
  ...WebpackBaseConfiguration
};

export default config;
