# ALCE

Accepting Language Config Environment - "Alice"

Human friendly, machine editable, JSON-like config file format. Takes the JSON out of humans' nightmares.

Extends JSON to allow for:

- Comments
- Regular expressions
- Relaxed identifier and syntax handling

## Example

```javascript
{
  // Section 1. Global config
  content: "foo",

  // Section 2. Environment config
  // WARN: A meaningful here be dragons comment
  otherContent: [
    // Note that trailing spaces and single quotes don't cause mass chaos
    'see!',
  ]
}
```

## Usage

```
npm install --save alce
```

```javascript
var ALCE = require('alce');

var config = ALCE.parse(configSource, {meta: true});
config.set('key', 'new value');
config.toString();
config.toObject();
```

## API

### ALCE.parse(configSource, options)

Parses a string containing a ACLE source file. Returns an ACLE object.

- `configSource`: String representation of the configuration file
- `options`: Options hash.
  - `meta` : Set to truthy to return an editable version of the config that may be reconstructed. Falsy returns generic javascript object. See [#toObject](#toObject).
  - Formatter options. See [Formatters](#formatters) for more info

### ALCE.stringify(object, options)

Converts a ACLE or javascript object to it's string representation.

- `object`: Object to convert to a string
- `options`: Formatter options when converting a javascript object. See [Formatters](#formatters) for more info.

### Metadata Objects

#### #get(id)

Returns the ACLE or primitive value stored on the object under a given key. `undefined` if no key exists.

#### #set(id, value)

Sets `value` to `id` converting to an ACLE object as necessary. If replacing an existing value, the formatting of that value will be maintained. If creating a new value, or child values, will use the rules defined in the `options` formatters.

#### #remove(id)

Removes the key specified by `id`.

#### Array-like methods

ACLE instances representing arrays additionally implement:

- `length`
- `push`
- `pop`
- `unshift`
- `shift`
- `splice`

All of which behave as they would if operating on an normal array.

#### #toString()

Returns the current config node contents in as close to the user's input format as possible.

#### #toObject()

Returns a generic javascript object with all config values stripped of any metadata. Useful for passing to other APIs or when metadata is not necessary.


### Formatters

Formatters control how newly created nodes are rendering. The may modify the `preamble`, `prologue`,
and if applicable `innerPrologue`, fields on the new objects to control the formatting around the new object.


### #seedIndent(parent, object)

Called for both parsed and new objects, allowing for the formatter to determine any state information necessary.

```javascript
  seedIndent: function(parent, object) {
    if (parent) {
      object.indent = exports.calcIndent(parent.preamble || '') + (parent.isArray ? '  ' : '');
    } else {
      object.indent = '';
    }
  },
```

#### #objectFormatter(parent, object)

Called when a new object or array is created. Generally `parent` will be an array instance or a property. The `isArray` field may be used to determine if `parent` or `object` is an array.

```javascript
  objectFormatter: function(parent, object) {
    object.innerPrologue = '\n' + object.indent;
  },
```

#### #insertFormatter(parent, insert)

Called when a new value is inserted into an array or object instance. `insert` will be pushed to the end of the `parent.children` list after this operation occurs.

```javascript
  insertFormatter: function(parent, insert) {
    var indent = parent.indent || ALCE.calcIndent(parent.preamble);
    insert.preamble = (parent.children.length ? ',' : '') + '\n  ' + indent;
  },
```

#### #propertyFormatter(parent, property)

Called when a new property is created. This is useful for defining the `separator` value for a property.

```javascript
  propertyFormatter: function(parent, property) {
    property.separator = ': ';
  }
```

#### ALCE.TWO_SPACE_FORMATTER

Formatter options that output two space indented data structures with trailing commas. May be passed directly into the `options` parameter for both `parse` and `serialize`.

#### ALCE.calcIndent(preamble)

Utilitity method for formatters. Determines the indentation that should be used for a node relative to a given prefix. This is helpful for the `inserFormatter` to determine where to align new children inserted into an object.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/walmartlabs/alce/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

