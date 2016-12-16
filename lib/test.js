'use strict';

var zhuqu = require('./net');
zhuqu.grabUrl('http://www.ishadowsocks.com').then(function (data) {
	console.log(data.res.statusCode);
});