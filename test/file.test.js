var expect = require('chai').expect;

describe('测试文件模块: file', function() {
	var has = require('../lib/file').has;
  it('has', function() {
    expect(has('./package.json', 'file')).to.equal(true);
    expect(has('./package.json', 'dir')).to.equal(false);
    expect(has('./package.json', 'direw')).to.equal(false);
    expect(has('./lib', 'dir')).to.equal(true);
    expect(has('./lib', 'file')).to.equal(false);
    expect(has('./_lib', 'dir')).to.equal(false);
  });
});