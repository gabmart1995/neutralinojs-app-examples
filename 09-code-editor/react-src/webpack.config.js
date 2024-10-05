
const path = require('path');

const config = {
  entry: [
    './src/index.tsx'
  ],
  resolve: { // incluye las extensiones a importar
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
            'style-loader',
            'css-loader'
        ],
      },
      // images
      {
          test: /\.(png|jpg|svg|gif)$/,
          use: [
              'file-loader'
          ]
      },
    ]
  },
  devServer: {
    contentBase: './dist'
  }
};

module.exports = config;
    