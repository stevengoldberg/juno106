var util = require('../lib/util');

describe('util', function() {
  describe('#calcIndent', function() {
    it('should look at the last line only', function() {
      util.calcIndent('\n\n  \n\n    ').should.equal('    ');
    });
    it('should strip comments', function() {
      util.calcIndent('  /* foo   bar */  ').should.equal('    ');
      util.calcIndent('  // foo   bar   ').should.equal('  ');
      util.calcIndent('  /* foo \n  bar */  ').should.equal('    ');
    });

    it('should count from last control character', function() {
      util.calcIndent('    ,  ').should.equal('  ');
    });
  });

  describe('#extractRange', function() {
    it('should return range excluding wrapper', function() {
      util.extractRange('foobarfoo', [4, 7]).should.equal('bar');
      util.extractRange('foobarfoo', [0, 7]).should.equal('foobar');
      util.extractRange('foobarfoo', [4, 20]).should.equal('barfoo');
    });
    it('should handle empty or negative ranges', function() {
      util.extractRange('foobarfoo', [2, 2]).should.equal('');
      util.extractRange('foobarfoo', [2, -2]).should.equal('');
    });
  });
});
