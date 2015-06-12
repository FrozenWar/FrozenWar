var express = require('express');
var serveStatic = require('serve-static');
var morgan = require('morgan');

var port = 8000;

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var grunt = require('./lib/grunt.js');

console.log('Running grunt tasks before starting the server');
grunt(function(code) {
  if(code != 0) {
    console.log('Failed to run grunt, exiting');
    process.exit(code);
  }
  console.log('Starting web server at port', port);
  
  app.use(morgan('short'));
  app.use(new serveStatic('./build'));
  
  server.listen(port);
  
  console.log('Initializing game server');
  require('./src/Server')(io);
});
