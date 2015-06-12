var TurnEngine = require('ecstasy').TurnEngine;

// Builds game Engine
module.exports = function(isServer) {
  var engine = new TurnEngine(isServer);
  require('./Player')(engine);
  require('./Info')(engine);
  require('./Init')(engine);
  //require('./Move')(engine);
  //require('./Position')(engine);
  require('./Spawn')(engine);
  
  return engine;
}
