var Collection = require('./collection'),
    util = require('util');

module.exports = ObjectCollection;

function ObjectCollection(node, src, options) {
  Collection.apply(this, arguments);
}

util.inherits(ObjectCollection, Collection);

ObjectCollection.prototype.open = '{';
ObjectCollection.prototype.close = '}';

ObjectCollection.prototype.toObject = function() {
  var ret = {};
  this.children.forEach(function(child) {
    ret[child.key.toObject()] = child.value.toObject();
  });
  return ret;
};

ObjectCollection.prototype._getChild = function(id) {
  return this.values[id];
};

ObjectCollection.prototype.set = function(id, value) {
  // Require here to break circular dependency
  var ast = require('./index');

  var prop = this.values[id];
  if (!prop) {
    prop = new ast.Property(undefined, undefined, this.options);
    prop.key = ast.fromValue(id, undefined, undefined, this.options);

    if (this.options && this.options.propertyFormatter) {
      this.options.propertyFormatter(this, prop);
    }

    if (this.options && this.options.insertFormatter) {
      this.options.insertFormatter(this, prop);
    } else if (this.children.length) {
      prop.preamble = ',';
    }
  }

  var originalIndex = this.children.indexOf(prop);
  if (originalIndex < 0) {
    this.children.push(prop);
    this.values[id] = prop;
  }

  return prop.set(value);
};

ObjectCollection.fromObject = function(object, parent, options) {
  var node = new ObjectCollection(undefined, undefined, options);

  options.seedIndent && options.seedIndent(parent, node);
  options.objectFormatter && options.objectFormatter(parent, node);

  for (var name in object) {
    if (object.hasOwnProperty(name)) {
      node.set(name, object[name]);
    }
  }
  return node;
};
