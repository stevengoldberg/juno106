var AST = require('./ast'),
    esprima = require('esprima'),
    traverse = require('estraverse').traverse,
    util = require('./util'),
      extractRange = util.extractRange;


exports.parse = function(src, options) {
  options = generateOptions(options);

  src = src.toString();

  var ast,
      ret,
      stack = [];

  try {
    ast = esprima.parse('(' + src + ')', {range: true, loc: true});
  } catch (err) {
    throw new Error('Line: ' + err.lineNumber + ' Column: ' + err.column + ' - ' + err.message.replace(/Line.*: /, ''));
  }

  traverse(ast, {
    enter: function(node) {
      if (node.type === 'ExpressionStatement') {
        stack.unshift(new AST.Expression(node, src, options));
      } else if (node.type === 'ArrayExpression') {
        stack.unshift(new AST.Array(node, src, options));
      } else if (node.type === 'ObjectExpression') {
        stack.unshift(new AST.Object(node, src, options));
      } else if (node.type === 'Property') {
        stack.unshift(new AST.Property(node, src, options));
      } else if (node.type === 'Identifier' || node.type === 'Literal') {
        stack.unshift(new AST.Value(node, src, options));
      } else if (node.type === 'Program') {
        node.ignore = true;
      } else {
        throw new Error('Line: ' + node.loc.start.line + ' Column: ' + node.loc.start.column + ' - Unexpected node: ' + extractRange(src, node.range));
      }
    },
    leave: function(node) {
      if (node.ignore) {
        return;
      }

      var top = stack.shift(),
          parent = stack[0];

      if (top._leave) {
        ret = top._leave(src);
      }
      if (parent && parent._insert) {
        parent._insert(top, src);
      }
    }
  });

  return (options && options.meta) ? ret : ret.toObject();
};

exports.stringify = function(object, options) {
  if (!object || !object.toObject) {
    object = AST.fromValue(object, undefined, undefined, generateOptions(options));
  }

  return object.toString();
};

exports.calcIndent = util.calcIndent;

exports.TWO_SPACE_FORMATTER = {
  meta: true,
  seedIndent: function(parent, object) {
    if (parent) {
      object.indent = exports.calcIndent(parent.preamble || '') + (parent.isArray ? '  ' : '');
    } else {
      object.indent = '';
    }
  },
  objectFormatter: function(parent, object) {
    object.innerPrologue = '\n' + object.indent;
  },
  insertFormatter: function(parent, insert) {
    var indent = parent.indent || exports.calcIndent(parent.preamble);
    insert.preamble = (parent.children.length ? ',' : '') + '\n  ' + indent;
  },
  propertyFormatter: function(parent, property) {
    property.separator = ': ';
  }
};


function generateOptions(options) {
  var ret = {};

  for (var name in exports.TWO_SPACE_FORMATTER) {
    if (exports.TWO_SPACE_FORMATTER.hasOwnProperty(name) && name !== 'meta') {
      ret[name] = exports.TWO_SPACE_FORMATTER[name];
    }
  }
  for (var name in options) {
    if (options.hasOwnProperty(name)) {
      ret[name] = options[name];
    }
  }

  return ret;
}
