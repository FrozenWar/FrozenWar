function EventEmitter() {
  this._listeners = {};
}

EventEmitter.prototype._registerListener = function(event, listener) {
  if(this._listeners[event] == null) {
    this._listeners[event] = [];
  }
  this._listeners[event].push(listener);
}

EventEmitter.prototype.on = function(event, listener) {
  this._registerListener(event, {exec: listener});
}

EventEmitter.prototype.once = function(event, listener) {
  this._registerListener(event, {exec: listener, once: true});
}

EventEmitter.prototype.removeListener = function(event, listener) {
  if(this._listeners[event] == null) return;
  var idx = this._listeners[event].indexOf(listener);
  if(idx == -1) return;
  this._listeners[event].splice(idx, 1);
}

EventEmitter.prototype.removeAllListeners = function(event) {
  if(event) {
    this._listeners[event] = [];
  } else {
    this._listeners = {};
  }
}

EventEmitter.prototype.listeners = function(event) {
  var array = this._listeners[event];
  if(!array) return [];
  return array.map(function(value) {
    return value.exec;
  });
}

EventEmitter.prototype.emit = function(event) {
  var args = [];
  for(var i = 1; i < arguments.length; ++i) {
    args.push(arguments[i]);
  }
  var array = this._listeners[event];
  if(!array) return;
  for(var i = 0; i < array.length; ++i) {
    var entry = array[i];
    entry.exec.apply(this, args);
    if(entry.once) {
      array.splice(i, 1);
      i --;
    }
  }
}

if(typeof module != 'undefined') {
  module.exports = EventEmitter;
}