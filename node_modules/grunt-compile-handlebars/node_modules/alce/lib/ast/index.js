var ArrayCollection = require('./array'),
    Collection = require('./collection'),
    Expression = require('./expression'),
    ObjectCollection = require('./object'),
    Property = require('./property'),
    Value = require('./value');

module.exports = {
  Array: ArrayCollection,
  Collection: Collection,
  Expression: Expression,
  Object: ObjectCollection,
  Property: Property,
  Value: Value,

  fromValue: function(value, existingNode, parent, options) {
    if (value instanceof ArrayCollection || value instanceof ObjectCollection || value instanceof Value) {
      return value;
    }

    options = options || {};

    var node;
    if (Array.isArray(value)) {
      node = ArrayCollection.fromArray(value, parent, options);
    } else if (value && !(value instanceof RegExp) && typeof value === 'object') {
      node = ObjectCollection.fromObject(value, parent, options);
    } else {
      node = Value.fromValue(value, options);
    }
    if (existingNode) {
      node.preamble = existingNode.preamble;
      node.prologue = existingNode.prologue;
    }
    return node;
  }
};
