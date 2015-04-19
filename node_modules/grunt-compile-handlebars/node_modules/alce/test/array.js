var ast = require('../lib/ast');

describe('array', function() {
  describe('#length', function() {
    it('should return length', function() {
      ast.fromValue([1, 2]).length.should.equal(2);
    });
    it('should set length', function() {
      var value = ast.fromValue([1, 2]);
      value.length = 1;
      value.toObject().should.eql([1]);
    });
  });

  describe('#splice', function() {
    it('should insert/remove', function() {
      var value = ast.fromValue([1, 2, 5]);
      value.splice(1, 4, 3, 4).should.eql([2, 5]);
      value.toObject().should.eql([1, 3, 4]);
    });
  });

  describe('#push', function() {
    it('should push new values', function() {
      var value = ast.fromValue([1, 2]);
      value.push(3, 4).should.equal(4);
      value.toObject().should.eql([1, 2, 3, 4]);
    });
  });
  describe('#pop', function() {
    it('should remove values', function() {
      var value = ast.fromValue([1, 2]);
      value.pop().should.equal(2);
      value.toObject().should.eql([1]);
    });
  });

  describe('#unshift', function() {
    it('should unshift new values', function() {
      var value = ast.fromValue([1, 2]);
      value.unshift(3, 4).should.equal(4);
      value.toObject().should.eql([3, 4, 1, 2]);
    });
  });
  describe('#shift', function() {
    it('should remove values', function() {
      var value = ast.fromValue([1, 2]);
      value.shift().should.equal(1);
      value.toObject().should.eql([2]);
    });
  });
});
