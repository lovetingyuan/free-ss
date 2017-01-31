var expect = require('chai').expect;

describe('测试网络请求模块: request', function() {
  var githubBaseUrl = require('../lib/const').githubBaseUrl;
  var request = require('../lib/request').request;
  it('request测试', function() {
    return request(githubBaseUrl + '/package.json').then(function(data) {
    	data = JSON.parse(data);
      expect(data).to.be.an('object');
      expect(data.name).to.equal(require('../package.json').name);
    });
  });

  it('获取配置和账户', function() {
  	return request(githubBaseUrl + '/bin/config').then(function(data) {
  		data = JSON.parse(data);
  		expect(data).to.be.an('object');
  		expect(data.accountUrl).to.be.a('string');
  		return request(data.accountUrl);
  	}).then(function(data) {
  		data = JSON.parse(data);
  		expect(data.result).to.equal(true);
  		expect(data.data).to.be.an('array');
  	});
  });
});