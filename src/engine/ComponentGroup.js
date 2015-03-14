var BitSet = require('./BitSet.js');
var EventEmitter = require('./EventEmitter.js');

function ComponentGroup(contain, intersect, exclude) {
  EventEmitter.call(this);
  // ID는 엔진이 부여
  this.id = null;
  this._engine = null;
  this.contain = contain;
  this.intersect = intersect;
  this.exclude = exclude;
}

ComponentGroup.prototype = Object.create(EventEmitter.prototype);
ComponentGroup.prototype.constructor = ComponentGroup;

ComponentGroup.prototype.matches = function(entity) {
  var compBits = entity.componentBits;
  
  if(compBits.isEmpty()) return false;
  if(!compBits.contains(this.contain)) return false;
  if(!this.intersect.isEmpty() && !this.intersect.intersects(compBits)) return false;
  if(this.exclude.intersects(compBits)) return false;
  return true;
}

ComponentGroup.prototype.equals = function(o) {
  if(!this.contain.equals(o.contain)) return false;
  if(!this.intersect.equals(o.intersect)) return false;
  if(!this.exclude.equals(o.exclude)) return false;
  return true;
}

ComponentGroup.createBuilder = function(engine) {
  return new ComponentGroup.Builder(engine);
}

ComponentGroup.Builder = function(engine) {
  this._engine = engine;
  this._contain = new BitSet();
  this._intersect = new BitSet();
  this._exclude = new BitSet();
}


ComponentGroup.Builder.prototype.reset = function() {
  this._contain = new BitSet();
  this._intersect = new BitSet();
  this._exclude = new BitSet();
}

ComponentGroup.Builder.prototype.contain = function(args) {
  this._contain.or(this._engine.getComponentsBitSet(arguments));
  return this;
}

ComponentGroup.Builder.prototype.intersect = function(args) {
  this._intersect.or(this._engine.getComponentsBitSet(arguments));
  return this;
}

ComponentGroup.Builder.prototype.exclude = function(args) {
  this._exclude.or(this._engine.getComponentsBitSet(arguments));
  return this;
}

ComponentGroup.Builder.prototype.build = function() {
  return new ComponentGroup(this._contain, this._intersect, this._exclude);
}

if(typeof module != 'undefined') {
  module.exports = ComponentGroup;
}