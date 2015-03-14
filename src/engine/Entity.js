var BitSet = require('./BitSet.js');
var EventEmitter = require('./EventEmitter.js');

/**
 * Represents a Entity.
 * Entity is a simple object that holds {@link Component}.
 * @constructor
 * @extends EventEmitter
 * @param engine {Engine} - The Engine associated with this object.
 */
function Entity(engine) {
  EventEmitter.call(this);
  /**
   * The ID of this object.
   * This will be given by Engine, and it shouldn't be edited.
   * @readonly
   * @var {Number}
   */
  this.id = null;
  /**
   * The Engine associated with this object.
   * @private
   * @var {Engine}
   */
  this._engine = engine;
  /**
   * The BitSet holding information about what kind of Component this has.
   * @var {BitSet}
   */
  this.componentBits = new BitSet();
  /**
   * The BitSet holding information about what ComponentGroup this matches.
   * @var {BitSet}
   */
  this.componentGroupBits = new BitSet();
  /**
   * The key-value storage of Components.
   * @var {Object}
   */
  this.components = {};
  /**
   * The array of Components.
   * @var {Array}
   */
  this.componentsArray = [];
}

Entity.prototype = Object.create(EventEmitter.prototype);
Entity.prototype.constructor = Entity;

/**
 * Adds the Component to the Entity.
 * @param component {Component} - The Component to add.
 * @fires Entity#componentAdded
 */
Entity.prototype.add = function(component) {
  var bitPos = this._engine.getComponentBit(component.constructor);
  this.componentBits.set(bitPos, true);
  this.components[bitPos] = component;
  this.componentsArray.push(component);
  /**
   * This event is fired when a Component is added to the Entity.
   * @event Entity#componentAdded
   * @property {Entity} 0 - the Entity.
   * @property {Component} 1 - the Component added to Entity.
   */
  this.emit('componentAdded', this, component);
}

/**
 * Removes the Component from the Entity.
 * @param component {Function} - The Component's constructor to remove.
 * @fires Entity#componentRemoved
 */
Entity.prototype.remove = function(component) {
  var bitPos;
  if(typeof component == 'function') {
    bitPos = this._engine.getComponentBit(component);
  } else {
    bitPos = this._engine.getComponentBit(component.constructor);
  }
  this.componentBits.set(bitPos, false);
  var orig = this.components[bitPos];
  this.componentsArray.splice(this.componentsArray.indexOf(orig), 1);
  delete this.components[bitPos];
  /**
   * This event is fired when a Component is removed from the Entity.
   * @event Entity#componentRemoved
   * @property {Entity} 0 - the Entity.
   * @property {Component} 1 - the Component removed from Entity.
   */
  this.emit('componentRemoved', this, component);
}

/**
 * Removes all the {@link Component} from the Entity.
 */
Entity.prototype.removeAll = function() {
  while(this.componentsArray.length > 0) {
    this.remove(this.componentsArray[0]);
  }
}

/**
 * Returns the Component which this Entity has.
 * @param component {Function} - The constructor of the {@link Component}.
 * @returns {Component} The component.
 */
Entity.prototype.get = function(component) {
  var bitPos = this._engine.getComponentBit(component);
  return this.components[bitPos];
}

/**
 * Returns an array of this Entity's {@link Component}s.
 * @returns {Array} An array of Components.
 */
Entity.prototype.getComponents = function() {
  return this.componentsArray;
}

/**
 * Checks whether if this Entity has the Component.
 * @param component {Component} - The component to check.
 * @returns {Boolean} Whether if this Entity has the Component.
 */
Entity.prototype.has = function(component) {
  var bitPos = this._engine.getComponentBit(component);
  return this.componentBits.get(bitPos);
}

if(typeof module != 'undefined') {
  module.exports = Entity;
}
