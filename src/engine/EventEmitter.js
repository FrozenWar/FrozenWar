/**
 * This class allows to emit events like node.js.
 * Basically it's equivalent to node.js EventEmitter.
 * @constructor
 */
function EventEmitter() {
  this._listeners = {};
  this._onces = {};
  this._thisObjs = {};
}

/**
 * Registers a listener.
 * @param event {String} - The name of the event.
 * @param listener {Function} - The function to be triggered.
 */
EventEmitter.prototype.on = function(event, listener, thisObj) {
  if(this._listeners[event] == null) {
    this._listeners[event] = [];
  }
  if(this._onces[event] == null) {
    this._onces[event] = [];
  }
  if(this._thisObjs[event] == null) {
    this._thisObjs[event] = [];
  }
  this._listeners[event].push(listener);
  this._thisObjs[event].push(thisObj);
}

/**
 * Registers a one-time listener.
 * The listener will be removed after being triggered once.
 * @param event {String} - The name of the event.
 * @param listener {Function} - The function to be triggered.
 */
EventEmitter.prototype.once = function(event, listener, thisObj) {
  this.on(event, listener, thisObj);
  this._onces[event].push(listener);
}

/**
 * Removes the listener.
 * @param event {String} - The name of the event.
 * @param listener {Function} - The function to be removed.
 */
EventEmitter.prototype.removeListener = function(event, listener) {
  if(this._listeners[event] == null) return;
  var idx = this._listeners[event].indexOf(listener);
  if(idx == -1) return;
  this._listeners[event].splice(idx, 1);
  this._thisObjs[event].splice(idx, 1);
  if(this._onces[event] == null) return;
  var idx = this._onces[event].indexOf(listener);
  if(idx == -1) return;
  this._onces[event].splice(idx, 1);
}

/**
 * Removes all the listener with specified event type.
 * If event parameter is not set, it will remove all the listener of all types.
 * @param [event] {String} - The name of the event.
 */
EventEmitter.prototype.removeAllListeners = function(event) {
  if(event) {
    this._listeners[event] = [];
    this._onces[event] = [];
    this._thisObjs[event] = [];
  } else {
    this._listeners = {};
    this._onces = {};
    this._thisObjs = {};
  }
}

/**
 * Returns the array of listeners with specified event type.
 * @param event {String} - The name of the event.
 * @returns {Array} An array holding event listeners.
 */
EventEmitter.prototype.listeners = function(event) {
  var array = this._listeners[event];
  if(!array) return [];
  return array;
}

/**
 * Emits the event.
 * This will trigger all the listener with that event type.
 * You can supply listener function's arguments by appending
 * arguments after the 'event' parameter.
 * @param event {String} - The name of the event.
 * @param args... - Arguments to supply to listeners.
 */
EventEmitter.prototype.emit = function(event) {
  var args = [];
  for(var i = 1; i < arguments.length; ++i) {
    args.push(arguments[i]);
  }
  var array = this._listeners[event];
  var onceArray = this._onces[event];
  var thisArray = this._thisObjs[event];
  if(!array) return;
  for(var i = 0; i < array.length; ++i) {
    var entry = array[i];
    entry.apply(thisArray[i], args);
    var onceIdx = onceArray.indexOf(entry);
    if(onceIdx != -1) {
      array.splice(i, 1);
      thisArray.splice(i, 1);
      onceArray.splice(onceIdx, 1);
      i --;
    }
  }
}

Package.EventEmitter = EventEmitter;
