var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');

var port = 8000;

var loader = require('./loader.js');

console.log('Processing game code');
var gameLibCode = loader.parse();
/*if(process.env.NODE_ENV != 'production') {
  console.log('Saving copy of game code');
  fs.writeFileSync('game_lib.js', gameLibCode);
}*/
console.log('Loading game code');
var Package = loader.load(gameLibCode);

console.log('Processing client side code');
var clientCode = loader.parseClient();

console.log('Starting web server at port', port);

var app = express();

app.all('/js/game_lib.js', function(req, res, next) {
  res.type('js').end(gameLibCode);
});

app.all('/js/client.js', function(req, res, next) {
  res.type('js').end(clientCode);
});

app.use(new serveStatic('./public'));

app.listen(port);