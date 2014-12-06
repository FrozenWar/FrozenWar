var isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production';

var express = require('express');
var serveStatic = require('serve-static');

var app = module.exports = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/js', serveStatic(__dirname + '/client'));
app.use('/js', serveStatic(__dirname + '/shared'));
app.use(serveStatic(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

if (!module.parent) {
    var server = http.listen(isProduction ? 80 : 3001, function(err) {
        console.log('Listening on port %d', server.address().port);
    });
}

var domain = require('./server/loader');
console.log('Loaded game data.');
console.log(domain.keys());

io.on('connection', function(socket){
  console.log('Client connected, sending domain list');
  socket.emit('domain', domain.keys());
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
