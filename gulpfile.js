var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackDevServer = require('webpack-dev-server');
var del = require('del');

var webpackConfiguration = {
  context: path.resolve(__dirname, 'src'),
  entry: './client.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'FrozenWar'
    })
  ],
  node: {
    fs: 'empty'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/i,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.json$/i,
        loader: 'json'
      },
      {
        test: /\.html?$/i,
        loader: 'html'
      },
      {
        test: /\.css$/i,
        loader: 'style!css'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      }
    ]
  }
};

gulp.task('lint', function () {
  return gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('mocha', function() {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list' }))
    .on('error', gutil.log);
});

gulp.task('webpack', function(callback) {
  // run webpack
  webpack(webpackConfiguration, function(err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({}));
    callback();
  });
});

gulp.task('devserver', function() {
  // Start a webpack-dev-server
  var compiler = webpack(webpackConfiguration);

  new WebpackDevServer(compiler, {
    // server and middleware options
  }).listen(8080, 'localhost', function(err) {
    if (err) throw new gutil.PluginError('webpack-dev-server', err);
    // Server listening
    gutil.log('[webpack-dev-server]',
      'http://localhost:8080/webpack-dev-server/index.html');
  });
});

gulp.task('watch', function() {
  gulp.watch(['src/**', 'test/**'], ['mocha', 'lint', 'webpack']);
});

gulp.task('clean', function(callback) {
  del([
    'dist/**/*'
  ], callback);
});

gulp.task('dev', ['devserver'], function() {
  gulp.watch(['src/**', 'test/**'], ['mocha', 'lint']);
});

gulp.task('default', ['mocha', 'lint', 'webpack']);
