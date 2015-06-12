var path = require('path');
module.exports = function(callback) {
  var process = require('child_process').fork(path.resolve(__dirname, 'gruntChild.js'));
  process.on('exit', function(code) {
    callback(code);
  });
}
