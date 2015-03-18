var fs = require('fs');

var loader = require('./loader.js');

console.log('Processing game code');
var gameLibCode = loader.parse();
if(process.env.NODE_ENV != 'production') {
  console.log('Saving copy of game code');
  fs.writeFileSync('game_lib.js', gameLibCode);
}
console.log('Loading game code');
var Package = loader.load(gameLibCode);
console.log('Complete!');
