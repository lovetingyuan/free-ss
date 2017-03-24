const path = require('path');
const os = require('os');
const URL = require('url');

const githubHost = 'api.github.com';
const repoUrl = require('../package.json').repository.url;

const repo = repoUrl.match(/github\.com\/([\s\S]+)\.git$/)[1] || 'lovetingyuan/fq';
const githubPath = `repos/${repo}/contents`;
const dirName = path.join(os.homedir(), 'shadowsocks');
const githubBaseUrl = URL.format({
  protocol: 'https:',
  host: githubHost,
  pathname: githubPath,
});
const githubHeaders = {
  Accept: 'application/vnd.github.VERSION.raw',
  'User-Agent': repo,
};
module.exports = {
  githubHost,
  githubPath,
  dirName,
  githubBaseUrl,
  githubHeaders,
};
