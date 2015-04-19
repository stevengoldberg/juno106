var Collection = require('./collection'),
    util = require('util');

module.exports = ArrayCollection;

function ArrayCollection(node, src, options) {
  Collection.apply(this, arguments);

  this.isArray = true;

  Object.defineProperty(this, 'length', {
    enumerable: true,
    get: function() {
      return this.children.length;
    },
    set: function(value) {
      this.children.length = value;
    }
  });
}

util.inherits(ArrayCollection, Collection);

ArrayCollection.prototype.splice = function(index, howMany /* value ... */) {
  var values = [].slice.call(arguments, 2),
      blanks = new Array(values.length);
  blanks.unshift(index, howMany);

  var ret = this.children.splice.apply(this.children, blanks);

  for (var i = 0; i < values.length; i++) {
    this.set(index + i, values[i]);
  }

  return ret.map(function(value) {
    return value.toObject();
  });
};

ArrayCollection.prototype.push = function(/* value ... */) {
  for (var i = 0; i < arguments.length; i++) {
    this.set(this.length, arguments[i]);
  }
  return this.length;
};
ArrayCollection.prototype.pop = function() {
  var ret = this.children.pop();
  if (ret) {
    return ret.toObject();
  }
};
ArrayCollection.prototype.unshift = function(/* value ... */) {
  for (var i = 0; i < arguments.length; i++) {
    this.children.unshift(undefined);
  }
  for (var i = 0; i < arguments.length; i++) {
    this.set(i, arguments[i]);
  }
  return this.length;
};
ArrayCollection.prototype.shift = function() {
  var ret = this.children.shift();
  if (ret) {
    return ret.toObject();
  }
};

ArrayCollection.prototype.open = '[';
ArrayCollection.prototype.close = ']';

ArrayCollection.prototype.toObject = function() {
  return this.children.map(function(child) { return child.toObject(); });
};

ArrayCollection.prototype._getChild = function(id) {
  return this.children[id];
};

ArrayCollection.prototype.set = function(id, value) {
  // Require here to break circular dependency
  var ast = require('./index');
  var original = this.children[id],
      node = ast.fromValue(value, original, this, this.options);

  if (!original) {
    if (this.options && this.options.insertFormatter) {
      this.options.insertFormatter(this, node);
    } else if (this.children.length) {
      node.preamble = ',';
    }
  }

  this.children[id] = node;
  if (node instanceof ast.Array || node instanceof ast.Object) {
    return node;
  } else {
    return node.toObject();
  }
};

ArrayCollection.fromArray = function(value, parent, options) {
  var node = new ArrayCollection(undefined, undefined, options);

  options.seedIndent && options.seedIndent(parent, node);
  options.objectFormatter && options.objectFormatter(parent, node);

  value.forEach(function(value, index) {
    node.set(index, value);
  });
  return node;
};
