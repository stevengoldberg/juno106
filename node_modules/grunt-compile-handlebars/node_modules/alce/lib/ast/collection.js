var util = require('../util'),
      extractRange = util.extractRange;

module.exports = Collection;

function Collection(node, src, options) {
  this.options = options;
  this.values = {};
  this.children = [];

  if (!node) {
    return;
  }

  this.range = node.range;
  this.innerRange = [node.range[0] + 1, node.range[1] - 1];
  this.source = extractRange(src, node.range);
}
Collection.prototype = {
  preamble: '',
  innerPrologue: '',
  prologue: '',

  get: function(id) {
    /*jshint eqnull:true */
    if (id != null) {
      var node = this._getChild(id);
      return node && node.get();
    } else {
      return this;
    }
  },

  remove: function(id) {
    if (this.values[id]) {
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].key && this.children[i].key.value===id) {
          this.children.splice(i,1);
          break;
        }
      }
      delete this.values[id];
    }
  },

  toString: function() {
    return this.preamble + this.open + this.children.join('') + this.innerPrologue + this.close + this.prologue;
  },

  _calcIndent: function(parent) {
    this.options.seedIndent && this.options.seedIndent(parent, this);

    for (var i = 0; i < this.children.length; i++) {
      this.children[i]._calcIndent(this);
    }
  },

  _leave: function(src) {
    var last = this.children[this.children.length - 1];

    if (last) {
      this.innerPrologue = extractRange(src, [last.range[1], this.innerRange[1]]);
    } else {
      this.innerPrologue = extractRange(src, this.innerRange);
    }
  },

  _insert: function(value, src) {
    if (value.key) {
      this.values[value.key.value] = value;
    }

    var priorSibling = this.children[this.children.length - 1];

    this.children.push(value);

    var priorRange;
    if (priorSibling) {
      priorRange = [priorSibling.range[1], value.range[0]];
    } else {
      priorRange = [this.innerRange[0], value.range[0]];
    }

    value.preamble = extractRange(src, priorRange);
  }
};
