'use strict';

var path = require('path');
var os = require('os');
var URL = require('url');

var githubHost = 'api.github.com';
var repoUrl = require('../package.json').repository.url;
var repo = repoUrl.match(/github\.com\/([\s\S]+)\.git$/)[1] || 'lovetingyuan/fq';
var githubPath = 'repos/' + repo + '/contents';
var dirName = path.join(os.homedir(), 'shadowsocks');
var githubBaseUrl = URL.format({
  protocol: 'https:',
  host: githubHost,
  pathname: githubPath
});
var githubHeaders = {
  Accept: 'application/vnd.github.VERSION.raw',
  'User-Agent': repo
};
module.exports = {
  githubHost: githubHost,
  githubPath: githubPath,
  dirName: dirName,
  githubBaseUrl: githubBaseUrl,
  githubHeaders: githubHeaders
};