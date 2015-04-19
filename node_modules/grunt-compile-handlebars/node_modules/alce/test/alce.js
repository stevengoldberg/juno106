'use strict';

var ALCE = require('../lib/alce'),
    fs = require('fs'),
    should = require('should');

describe('ALCE', function () {
  describe('#parse', function() {
    function parser(name, value) {
      it(name, function() {
        ALCE.parse(value, {meta: true}).toString().should.equal(value);
      });
    }
    parser('should parse simple objects', '{ foo: "bar"}');
    parser('should parse simple objects with trailing', '{ foo: "bar",}');
    parser('should parse simple objects with regexs', '{ foo: /foo/g}');
    parser('should parse simple objects with falsy', '{ foo: undefined, bar: null}');
    parser('should parse arrays', '["bar", 1, true]');
    parser('should parse comments around', '/*comment1*/ { foo: "bar"} // comment 2\n');

    it('should parse complicated objects', function () {
      var src = fs.readFileSync(__dirname + '/artifacts/lumbar.json');
      ALCE.stringify(ALCE.parse(src, {meta: true})).should.equal(src.toString());
    });

    it('should parse to a javascript object', function() {
      ALCE.parse('{ foo: "bar"}').should.eql({ foo: "bar"});
    });

    describe('error handling', function() {
      it('should handle syntax errors safely', function() {
        try {
          ALCE.parse('\n[ foo: "bar"]');
          should.fail('Should throw');
        } catch (err) {
          err.message.should.match(/Line: 2 Column: 6 - Unexpected token :/);
          err.stack.should.match(/\s*at .*?\.parse.*alce\.js/);
        }
      });
      it('should handle unsupported javscript constructs', function() {
        try {
          ALCE.parse('\n{ foo: function(){} }');
          should.fail('Should throw');
        } catch (err) {
          err.message.should.match(/Line: 2 Column: 7 - Unexpected node: function\(\)/);
        }
        try {
          ALCE.parse('\nif (true) { foo: 1 }');
          should.fail('Should throw');
        } catch (err) {
          err.message.should.match(/Line: 2 Column: 1 - Unexpected token if/);
          err.stack.should.match(/\s*at .*?\.parse.*alce\.js/);
        }
      });
      it('should handle duplicate key values', function() {
        var value = ALCE.parse('{/*1*/foo: true, /*2*/foo: false, }', {meta: true});
        value.toString().should.equal('{/*1*/foo: true, /*2*/foo: false, }');
        value.set('foo', 1);
        value.toString().should.equal('{/*1*/foo: true, /*2*/foo: 1, }');
      });
    });
  });

  describe('#stringify', function() {
    it('should convert to strings', function() {
      ALCE.stringify(ALCE.parse('{foo: "bar"}', {meta: true})).should.equal('{foo: "bar"}');
    });
    it('should handle javascript objects', function() {
      ALCE.stringify({foo: "bar"}).should.equal('{\n  "foo": "bar"\n}');
    });
    it('should allow formatter', function() {
      ALCE.stringify({foo: "bar"}, ALCE.TWO_SPACE_FORMATTER).should.equal('{\n  "foo": "bar"\n}');
    });
    it('should handle undefined', function() {
      ALCE.stringify().should.equal('undefined');
    });
  });

  describe('#toObject', function() {
    it('should remove metadata with toObject', function() {
      var src = fs.readFileSync(__dirname + '/artifacts/lumbar.json');
      ALCE.parse(src, {meta: true}).toObject().should.eql({
        modules: {
          foo: {},
          bar: {}
        },

        arrays: [ 'foo', 9, {bar: true}, [{nested: true}]],

        expression: ({foo : true}),
        "other stuff": true
      });
    });
  });

  describe('accessor', function() {
    describe('objects', function() {
      var config;
      beforeEach(function() {
        config = ALCE.parse('{\n  foo:\n    // a comment\n    true\n}', {meta: true});
      });
      it('should return values', function() {
        config.get('foo').should.equal(true);
      });
      it('should return complex values', function() {
        config = ALCE.parse('{\n  foo:\n    // a comment\n    {bar: "bat"}\n}', {meta: true});
        config.get('foo').get('bar').should.equal('bat');
      });
      it('should update existing values', function() {
        config.set('foo', false).should.equal(false);
        config.toString().should.equal('{\n  foo:\n    // a comment\n    false\n}');
      });
      it('should remove values', function() {
        config.remove('foo');
        config.toString().should.equal('{\n}');
      });
      it('should update existing values', function() {
        config.set('foo', {foo: 'bar'}).toObject().should.eql({foo: 'bar'});
        config.toString().should.equal('{\n  foo:\n    // a comment\n    {\n    "foo": "bar"\n  }\n}');
      });
      it('should insert new formatted values', function() {
        config = ALCE.parse('{\n  foo:\n    // a comment\n    true\n}', ALCE.TWO_SPACE_FORMATTER);
      });
      it('should insert new object values', function() {
        config = ALCE.parse('{\n  foo:\n    // a comment\n    true\n}', ALCE.TWO_SPACE_FORMATTER);
        config.set('bar', {foo: 'bar', baz: 'bat'});
        config.toString().should.equal('{\n  foo:\n    // a comment\n    true,\n  "bar": {\n    "foo": "bar",\n    "baz": "bat"\n  }\n}');
      });
      it('should insert new object nested values', function() {
        config = ALCE.parse('{\n  foo:\n    // a comment\n    true,\n  bar: {}\n}', ALCE.TWO_SPACE_FORMATTER);
        config.get('bar').set('bar', {foo: 'bar', baz: 'bat'});
        config.toString().should.equal('{\n  foo:\n    // a comment\n    true,\n  bar: {\n    "bar": {\n      "foo": "bar",\n      "baz": "bat"\n    }}\n}');
      });
      it('should insert new array values', function() {
        config = ALCE.parse('{\n  foo:\n    // a comment\n    true\n}', ALCE.TWO_SPACE_FORMATTER);
        config.set('bar', [1,2]);
        config.toString().should.equal('{\n  foo:\n    // a comment\n    true,\n  "bar": [\n    1,\n    2\n  ]\n}');
      });
      it('should insert regex values', function() {
        config = ALCE.parse('{\n  foo:\n    // a comment\n    true\n}', ALCE.TWO_SPACE_FORMATTER);
        config.set('bar', /foo/g);
        config.toString().should.equal('{\n  foo:\n    // a comment\n    true,\n  "bar": /foo/g\n}');
      });
      it('should insert falsy values', function() {
        config = ALCE.parse('{\n  foo:\n    // a comment\n    true\n}', ALCE.TWO_SPACE_FORMATTER);
        config.set('bar', undefined);
        config.toString().should.equal('{\n  foo:\n    // a comment\n    true,\n  "bar": undefined\n}');
      });
    });
    describe('arrays', function() {
      var config;
      beforeEach(function() {
        config = ALCE.parse('[\n    // a comment\n    true\n]', {meta: true});
      });

      it('should return values', function() {
        config.get(0).should.equal(true);
      });
      it('sold return complex values', function() {
        config = ALCE.parse('[[\n    // a comment\n    true\n]]', {meta: true});
        config.get(0).get(0).should.equal(true);
      });
      it('should return length', function() {
        config.length.should.equal(1);
      });

      it('should update existing values', function() {
        config.set(0, false).should.equal(false);
        config.toString().should.equal('[\n    // a comment\n    false\n]');
      });
      it('should update existing values with complex', function() {
        config.set(0, {foo: 'bar'}).toObject().should.eql({foo: 'bar'});
        config.toString().should.equal('[\n    // a comment\n    {\n    "foo": "bar"\n  }\n]');
      });
      it('should insert new formatted values', function() {
        config = ALCE.parse('[\n    // a comment\n    true\n]', ALCE.TWO_SPACE_FORMATTER);
        config.set(1, true);
        config.toString().should.equal('[\n    // a comment\n    true,\n  true\n]');
      });
      it('should insert new object values', function() {
        config = ALCE.parse('[\n    // a comment\n    true\n]', ALCE.TWO_SPACE_FORMATTER);
        config.set(1, {foo: 'bar', baz: 'bat'});
        config.toString().should.equal('[\n    // a comment\n    true,\n  {\n    "foo": "bar",\n    "baz": "bat"\n  }\n]');
      });
      it('should insert new array values', function() {
        config = ALCE.parse('[\n    // a comment\n    true\n]', ALCE.TWO_SPACE_FORMATTER);
        config.set(1, [1,2]);
        config.toString().should.equal('[\n    // a comment\n    true,\n  [\n    1,\n    2\n  ]\n]');
      });
    });
  });
});
