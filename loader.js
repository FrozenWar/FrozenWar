var vm = require('vm');
var fs = require('fs');
var path = require('path');
var UglifyJS = require("uglify-js");

function compressCode(urls, srcPath) {
  var result = UglifyJS.minify(urls.map(function(value) {
      return path.resolve(srcPath, value);
    }), {
    output: {
      beautify: true,
      indent_level: 2,
      comments: false
    },
    mangle: false
  });
  return result.code;
}

module.exports.parse = function() {
  var urls = JSON.parse(fs.readFileSync(path.resolve(__dirname, './src/files.json')));
  var srcPath = path.resolve(__dirname, './src/');

  return compressCode(urls, srcPath);
}

module.exports.parseClient = function() {
  var urls = JSON.parse(fs.readFileSync(path.resolve(__dirname, './client/files.json')));
  var srcPath = path.resolve(__dirname, './client/');

  return compressCode(urls, srcPath);
}

module.exports.load = function(code) {
  var scope = {
    Package: {}
  };

  var sandbox = vm.createContext(scope);
  vm.runInContext(code, sandbox, 'game_lib.js');

  return scope.Package;
}
