var Component = require('./Component.js');

function PlayerComponent(id, name) {
  this.id = id;
  this.name = name;
  Component.call(this);
}

PlayerComponent.prototype = Object.create(Component.prototype);
PlayerComponent.prototype.constructor = PlayerComponent;

if(typeof module != 'undefined') {
  module.exports = PlayerComponent;
}