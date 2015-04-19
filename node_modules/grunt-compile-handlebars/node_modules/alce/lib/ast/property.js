var util = require('../util'),
      extractRange = util.extractRange;

module.exports = Property;

function Property(node, src, options) {
  this.options = options;

  if (!node) {
    return;
  }

  this.range = node.range;
  this.source = extractRange(src, node.range);
}
Property.prototype = {
  preamble: '',
  key: undefined,
  separator: ':',
  value: undefined,
  prologue: '',

  get: function() {
    return this.value && this.value.get();
  },
  set: function(value) {
    // Require here to break circular dependency
    var ast = require('./index');
    this.value = ast.fromValue(value, this.value, this, this.options);

    if (this.value instanceof ast.Array || this.value instanceof ast.Object) {
      return this.value;
    } else {
      return this.value.toObject();
    }
  },

  toString: function() {
    return this.preamble + this.key + this.separator + this.value + this.prologue;
  },

  _calcIndent: function(parent) {
    this.options.seedIndent && this.options.seedIndent(parent, this);

    this.key._calcIndent(this);
    this.value._calcIndent(this);
  },

  _leave: function(src) {
    this.separator = extractRange(src, [this.key.range[1], this.value.range[0]]);
    this.prologue = extractRange(src, [this.value.range[1], this.range[1]]);
  },
  _insert: function(value) {
    if (!this.key) {
      this.key = value;
    } else {
      this.value = value;
    }
  }
};
