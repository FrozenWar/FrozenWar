var isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production';

var express = require('express');
var serveStatic = require('serve-static');

var app = module.exports = express();

app.use('/js', serveStatic(__dirname + '/client'));
app.use('/js', serveStatic(__dirname + '/shared'));
app.use(serveStatic(__dirname + '/public'));

if (!module.parent) {
    var server = app.listen(isProduction ? 80 : 3001, function(err) {
        console.log('Listening on port %d', server.address().port);
    });
}
