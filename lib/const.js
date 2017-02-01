'use strict';

var path = require('path');
var os = require('os');
var URL = require('url');

var githubHost = 'api.github.com';
var githubPath = 'repos/lovetingyuan/fq/contents';
var dirName = path.join(os.homedir(), 'shadowsocks');
var githubBaseUrl = URL.format({
  protocol: 'https:',
  host: githubHost,
  pathname: githubPath
});
var githubHeaders = {
  Accept: 'application/vnd.github.VERSION.raw',
  'User-Agent': 'lovetingyuan/fq'
};
module.exports = {
  githubHost: githubHost,
  githubPath: githubPath,
  dirName: dirName,
  githubBaseUrl: githubBaseUrl,
  githubHeaders: githubHeaders
};