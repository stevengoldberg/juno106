var util = require('../util'),
      extractRange = util.extractRange;

module.exports = Value;

function Value(node, src, options) {
  this.options = options;

  if (!node) {
    return;
  }

  this.range = node.range;
  this.source = extractRange(src, node.range);

  this.value = node.name || node.value;
}
Value.prototype = {
  preamble: '',
  prologue: '',

  get: function() {
    return this.value;
  },
  set: function(value) {
    /* jshint eqnull: true */
    this.value = value;

    if (value instanceof RegExp) {
      this.source = value.toString();
    } else {
      this.source = value != null ? JSON.stringify(value) : value+'';
    }
  },

  toString: function() {
    return this.preamble + this.source + this.prologue;
  },
  toObject: function() {
    return this.value;
  },

  _calcIndent: function(parent) {
    this.options.seedIndent && this.options.seedIndent(parent, this);
  }
};

Value.fromValue = function(value, options) {
  var node = new Value(undefined, undefined, options);
  node.set(value);
  return node;
};
