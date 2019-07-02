const path = require('path');
const webpack = require('webpack');

/**
 * PostCSS plugins
 */
const postCssCssNano = require('cssnano');
const postCssAutoprefixer = require('autoprefixer');
const postCssUrl = require('postcss-url');
const postCssPresetEnv = require('postcss-preset-env');
const postCssFlexBugsFixes = require('postcss-flexbugs-fixes');

/**
 * Webpack plugins
 */
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SERVER_HOST = 'localhost';
const SERVER_PORT = process.env.DEV_SERVER_PORT || 3000;
const ASSET_PATH = IS_PRODUCTION ? '/' : `http://${SERVER_HOST}:${SERVER_PORT}/`;

const styleLoader = (isLoadResources = true, isSassSyntax = true) => {
  const loaders = [
    {
      loader: ExtractCssChunks.loader,
      options: {
        // if you want HMR - we try to automatically inject hot
        // reloading but if it's not working, add it to the config
        hot: !IS_PRODUCTION,
        // modules: true, // if you use cssModules, this can help.
        // reloadAll: true, // when desperation kicks in - this is a brute force HMR flag
      },
    },
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        plugins: (() => {
          const plugins = [];
          plugins.push(
            postCssFlexBugsFixes(),
            // postCssPresetEnv(),
            postCssUrl(),
            postCssAutoprefixer(),
          );
          if (IS_PRODUCTION) {
            plugins.push(postCssCssNano());
          }
          return plugins;
        })(),
      },
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
        indentedSyntax: isSassSyntax,
        includePaths: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'src')],
      },
    },
  ];

  if (isLoadResources) {
    loaders.push({
      loader: 'sass-resources-loader',
      options: {
        sourceMap: true,
        resources: path.resolve(__dirname, 'src', 'common', 'index.scss'),
      },
    });
  }

  return loaders;
};

const config = {
  mode: process.env.NODE_ENV,
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: [path.resolve(__dirname, 'src', 'index.tsx')],
  },
  output: {
    // filename: 'js/[name].js',
    // chunkFilename: 'js/[name].js',
    filename: IS_PRODUCTION ? 'js/[name]-[chunkhash].js' : 'js/[name].js',
    chunkFilename: IS_PRODUCTION ? 'js/[name]-[chunkhash].js' : 'js/[name].js',
    path: path.resolve(__dirname, 'build'),
    publicPath: ASSET_PATH,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        // exclude: /vendors/i,
        sourceMap: true,
        uglifyOptions: {
          sourceMap: true,
          output: {
            comments: false,
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 1,
          name: 'vendors',
          chunks: 'initial',
          enforce: true,
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        options: {
          onlyCompileBundledFiles: true,
        },
      },
      {
        test: /\.(jsx|es6)$/,
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, 'babel.config.js'),
        },
      },
      {
        test: /informed/,
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, 'babel.config.js'),
        },
      },
      {
        test: /react\-dropdown\-tree\-select/,
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, 'babel.commonjs.config.js'),
        },
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name]-[hash:8].[ext]',
            },
          },
        ],
        exclude: [
          path.resolve(__dirname, 'src', 'fonts'),
          path.resolve(__dirname, 'src', 'images'),
          /inline/i,
        ],
      },
      {
        // Контентные картинки
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name]-[hash:8].[ext]',
              publicPath: './',
            },
          },
        ],
        include: [path.resolve(__dirname, 'src', 'images')],
        exclude: [/inline/i],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-inline-loader?classPrefix',
          },
          // {
          //   loader: 'svgo-loader',
          //   options: {
          //     plugins: [{ removeViewBox: false }],
          //   },
          // },
        ],
        include: [/inline/i],
      },
      {
        test: /\.(woff|woff2|eot|otf|ttf|svg)(\?.*$|$)/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name]-[hash:8].[ext]',
            },
          },
        ],
        include: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'src', 'fonts')],
        exclude: [/inline/i],
      },
      {
        test: /\.sass$/,
        use: styleLoader(),
      },
      {
        test: /\.scss$/,
        use: styleLoader(true, false),
      },
      {
        test: /\.css$/,
        use: styleLoader(false, false),
      },
    ],
  },

  resolve: {
    modules: [
      // 'node_modules', // нужно чтоб правильно разрешались зависимости в пакетах, если пакет требудет другую версию
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'src'),
    ],
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
    extensions: ['*', '.ts', '.tsx', '.jsx', '.js', '.es6', '.css', '.scss', '.sass'],
  },

  devtool: IS_PRODUCTION ? 'none' : 'inline-cheap-source-map',

  stats: {
    // copied from `'minimal'`
    all: false,
    modules: true,
    maxModules: 0,
    errors: true,
    warnings: true,
    // our additional options
    moduleTrace: true,
    errorDetails: true,
  },

  devServer: {
    stats: {
      // copied from `'minimal'`
      all: false,
      modules: true,
      maxModules: 0,
      errors: true,
      warnings: true,
      // our additional options
      moduleTrace: true,
      errorDetails: true,
    },
    clientLogLevel: 'error',
    host: SERVER_HOST,
    port: SERVER_PORT,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.resolve(__dirname, 'src'),
    historyApiFallback: true,
  },

  plugins: [
    new ExtractCssChunks({
      // filename: 'css/[name].css',
      // chunkFilename: 'css/[name].css',
      filename: IS_PRODUCTION ? 'css/[name]-[chunkhash].css' : 'css/[name].css',
      chunkfilename: IS_PRODUCTION ? 'css/[name]-[id].css' : 'css/[name].css',
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
    }),
  ],
};

if (IS_PRODUCTION) {
  config.plugins.push(new CleanWebpackPlugin());
  config.plugins.push(
    new CopyPlugin([
      {
        from: 'favicon',
        to: 'favicon',
      },
    ]),
  );
}

config.plugins.push(
  new ManifestPlugin({
    fileName: path.resolve(__dirname, 'build', 'manifest.json'),
    publicPath: ASSET_PATH,
    writeToFileEmit: true,
  }),
);

module.exports = config;
