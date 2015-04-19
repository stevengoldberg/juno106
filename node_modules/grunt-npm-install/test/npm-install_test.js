'use strict';

var grunt = require('grunt');
var exists = grunt.file.exists;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.npm_install = {
  'npm-install': function (test) {
    test.expect(3);

    test.ok(exists('tmp/node_modules/jassi'), 'Dependencies should have been installed.');
    test.ok(exists('tmp/node_modules/q'), 'Single module sohuld have been installed.');
    test.ok(exists('tmp/node_modules/lodash') && exists('tmp/node_modules/async'), 'Multiple modules sohuld have been installed.');

    test.done();
  }
};
