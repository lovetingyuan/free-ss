var expect = require('chai').expect;

describe('测试freess, 应该打印客户端的进程ID', function() {
	var main = require('../index');
  it('主测试', function() {
    return main().then(function(data) {
      expect(data).to.be.an('object');
      expect(data.result).to.equal('success');
      expect(data.data).to.be.a('number');
    });
  });
});
