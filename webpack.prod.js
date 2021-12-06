const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
// var webpack = require('webpack');
var CompressionPlugin = require('compression-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: [
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    filename: 'bundle.js'
  },
  devtool: "",
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          },
        },
      },
      {
        test: /\.(css|less|styl|scss|sass|sss)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(bmp|gif|jpg|jpeg|png|svg|xls)$/,
        use: {
          loader: 'file-loader'
        }
      }
    ]
  },
  
  devServer: {
    historyApiFallback: true,
    contentBase: './public'
  },
  plugins: [
    // new webpack.DefinePlugin({ //<--key to reduce React's size
    //   'process.env': {
    //     'NODE_ENV': JSON.stringify('production')
    //   }
    // }),
    // new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.AggressiveMergingPlugin(),
    new CompressionPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 1024,
      minRatio: 1
    }),
    new HtmlWebPackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      favicon: "./public/favicon.png",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'firebase-messaging-sw.js', to: 'firebase-messaging-sw.js', toType: 'file'
        },
      ],
    }),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    // "alias": {
    //   "react": "preact-compat",
    //   "react-dom": "preact-compat"
    //   }
    },
};