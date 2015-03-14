/**
 * The inital size of BitSet.
 * @readonly
 * @static
 */
var INITAL_SIZE = 2;
/**
 * The bit size of a single word, which is uint32.
 * @readonly
 * @static
 */
var BITS_PER_WORD = 32;
/**
 * The bit size of a byte, which is 8 bits.
 * @readonly
 * @static
 */
var BITS_PER_BYTE = 8;

/**
 * Implements an array of bits that grows by itself. Each bit is a boolean,
 * and its index is non-negative integer. 
 * Basically it's Javascript implementation of Java's BitSet.
 * @constructor
 * @param [value] - Initial value for the BitSet.
 */
function BitSet(value) {
  if(value instanceof BitSet) {
    this._words = new Uint32Array(value._words);
  } else if(value != null) {
    this._words = new Uint32Array(value);
  } else {
    this._words = new Uint32Array(INITAL_SIZE);
  }
}

/**
 * Reallocates BitSet to expand to the requested bit size.
 * @private
 * @param bitSize {Number} - the requested bit size.
 */
BitSet.prototype._reallocate = function(bitSize) {
  while(this._words.length < ((bitSize / BITS_PER_WORD)|0)) {
    var newWords = new Uint32Array(this._words.length * 2);
    newWords.set(this._words);
    this._words = newWords;
  }
}

/**
 * Returns BitSet's allocated size in bits.
 * @returns {Number} - allocated size in bits.
 */
BitSet.prototype.size = function() {
  return this._words.byteLength * BITS_PER_BYTE;
}

/**
 * Sets specified bit to false.
 * @param pos {Number} - A bit position to set to false.
 * @see {@link BitSet#set}
 */
BitSet.prototype.clear = function(pos) {
  this.set(pos, false);
}

/**
 * Sets specified bits to false.
 * @param from {Number} - A start bit position.
 * @param to {Number} - A end bit position.
 * @see {@link BitSet#setRange}
 */
BitSet.prototype.clearRange = function(from, to) {
  this.setRange(from, to, false);
}

BitSet.prototype.clearAll = function() {
  this.setAll(false);
}

BitSet.prototype.set = function(pos, set) {
  pos |= 0;
  this._reallocate(pos);
  var wordPos = pos / BITS_PER_WORD | 0;
  var shiftPos = (pos % BITS_PER_WORD);
  if(set) {
    this._words[wordPos] |= 1 << shiftPos;
  } else {
    this._words[wordPos] &= ~(1 << shiftPos);
  } 
}

BitSet.prototype.setRange = function(from, to, set) {
  for(var i = from; i <= to; ++i) {
    this.set(i, set);
  }
}

BitSet.prototype.setAll = function(set) {
  this.setRange(0, this.size()-1, set);
}

BitSet.prototype.get = function(pos) {
  pos |= 0;
  this._reallocate(pos);
  var wordPos = pos / BITS_PER_WORD | 0;
  var shiftPos = (pos % BITS_PER_WORD);
  return (this._words[wordPos] & (1 << shiftPos)) > 0;
}

// logic functions

// aka intersection

BitSet.prototype.and = function(set) {
  if(set == null) {
    this.clearAll();
    return;
  }
  var intersectSize = Math.min(this._words.length, set._words.length)|0;
  var unionSize = Math.max(this._words.length, set._words.length)|0;
  this._reallocate(unionSize * BITS_PER_WORD);
  for(var i = 0; i < unionSize; ++i) {
    if(i > intersectSize) {
      this._words[i] = 0;
    } else {
      this._words[i] &= set._words[i];
    }
  }
}

// aka union

BitSet.prototype.or = function(set) {
  if(set == null) {
    return;
  }
  var intersectSize = Math.min(this._words.length, set._words.length)|0;
  var unionSize = Math.max(this._words.length, set._words.length)|0;
  this._reallocate(unionSize * BITS_PER_WORD);
  for(var i = 0; i < unionSize; ++i) {
    if(i > intersectSize) {
      if(this._words.length < set._words.length) {
        this._words[i] = set._words[i];
      }
    } else {
      this._words[i] |= set._words[i];
    }
  }
}

// ???

BitSet.prototype.xor = function(set) {
  if(set == null) {
    return;
  }
  var intersectSize = Math.min(this._words.length, set._words.length)|0;
  var unionSize = Math.max(this._words.length, set._words.length)|0;
  this._reallocate(unionSize * BITS_PER_WORD);
  for(var i = 0; i < unionSize; ++i) {
    if(i > intersectSize) {
      if(this._words.length < set._words.length) {
        this._words[i] = set._words[i];
      }
    } else {
      this._words[i] ^= set._words[i];
    }
  }
}

BitSet.prototype.not = function() {
  for(var i = 0; i < this._words.length; ++i) {
    this._words[i] = ~this._words[i];
  }
}

// compare functions

BitSet.prototype.isEmpty = function() {
  for(var i = 0; i < this._words.length; ++i) {
    if(this._words[i]) return false;
  }
  return true;
}

BitSet.prototype.intersects = function(set) {
  if(set == null) {
    return false;
  }
  var intersectSize = Math.min(this._words.length, set._words.length)|0;
  for(var i = 0; i < intersectSize; ++i) {
    if(this._words[i] & set._words[i]) return true;
  }
  return false;
}

// this -> set

BitSet.prototype.contains = function(set) {
  if(set == null) {
    return false;
  }
  var intersectSize = Math.min(this._words.length, set._words.length)|0;
  for(var i = 0; i < intersectSize; ++i) {
    if((this._words[i] & set._words[i]) != set._words[i]) return false;
  }
  return true;
}

BitSet.prototype.equals = function(set) {
  if(set == null || !(set instanceof BitSet)) {
    return false;
  }
  var intersectSize = Math.min(this._words.length, set._words.length)|0;
  var unionSize = Math.max(this._words.length, set._words.length)|0;
  for(var i = 0; i < unionSize; ++i) {
    if(i > intersectSize) {
      if(this._words.length < set._words.length) {
        if(set._words[i]) return false;
      } else {
        if(this._words[i]) return false;
      }
    } else {
      if((this._words[i] ^ set._words[i])) return false;
    }
  }
  return true;
}

BitSet.prototype.toString = function(redix) {
  var map = [];
  for(var i = 0; i < this._words.length; ++i) {
    var value = this._words[i];
    map.push(value.toString(redix || 2));
  }
  return map.reverse().join(' ');
}

if(typeof module != 'undefined') {
  module.exports = BitSet;
}
