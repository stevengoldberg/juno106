var ast = require('../lib/ast'),
    should = require('should');

describe('ast', function() {
  describe('#fromValue', function() {
    it('should handle existing AST instances', function() {
      var value = new ast.Array();
      ast.fromValue(value).should.equal(value);

      value = new ast.Object();
      ast.fromValue(value).should.equal(value);

      value = new ast.Value();
      ast.fromValue(value).should.equal(value);
    });
    it('should handle javascript objects', function() {
      var value = ast.fromValue({foo: 'bar'});
      value.should.be.instanceof(ast.Object);
      value.toString().should.equal('{"foo":"bar"}');

      value = ast.fromValue(['bar']);
      value.should.be.instanceof(ast.Array);
      value.toString().should.equal('["bar"]');
    });
    it('should handle primitive values', function() {
      function exec(expected, source) {
        var value = ast.fromValue(expected);
        value.should.be.instanceof(ast.Value);
        value.value.should.equal(expected);
        value.source.should.equal(source);
      }

      exec(true, 'true');
      exec(false, 'false');
      exec('true', '"true"');
      exec(0, '0');
      exec(1, '1');
    });
    it('should handle undefined values', function() {
        var value = ast.fromValue(undefined);
        value.should.be.instanceof(ast.Value);
        should.not.exist(value.value);
        value.source.should.equal('undefined');

        value = ast.fromValue(null);
        value.should.be.instanceof(ast.Value);
        should.not.exist(value.value);
        value.source.should.equal('null');
    });

    it('should maintain formatting for javascript objects', function() {
      var existing = new ast.Value();
      existing.preamble = '\n    ';
      existing.prologue = ' /* foo */';

      var newValue = ast.fromValue({foo: 'bar', baz: 'bat'}, existing);
      newValue.toString().should.equal('\n    {"foo":"bar","baz":"bat"} /* foo */');

      newValue = ast.fromValue(['foo', 'bar'], existing);
      newValue.toString().should.equal('\n    ["foo","bar"] /* foo */');
    });
    it('should maintain formatting of primitive values', function() {
      var existing = new ast.Value();
      existing.preamble = '\n    ';
      existing.prologue = ', /* foo */';

      var newValue = ast.fromValue('stringy', existing);
      newValue.toString().should.equal('\n    "stringy", /* foo */');
    });
  });
});
