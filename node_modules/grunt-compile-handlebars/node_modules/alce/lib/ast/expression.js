var util = require('../util'),
      extractRange = util.extractRange;

module.exports = Expression;

function Expression(node, src) {
  this.range = node.range;
}
Expression.prototype = {
  _leave: function(src) {
    this.root.preamble = extractRange(src, [this.range[0], this.root.range[0]]);
    this.root.prologue = extractRange(src, [this.root.range[1], this.range[1]]);

    this.root._calcIndent(this);

    return this.root;
  },
  _insert: function(value) {
    this.root = value;
  }
};
