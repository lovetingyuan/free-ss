const path = require('path');
const os = require('os');
const URL = require('url');

const githubHost = 'api.github.com';
const githubPath = 'repos/lovetingyuan/fq/contents';
const dirName = path.join(os.homedir(), 'shadowsocks');
const githubBaseUrl = URL.format({
  protocol: 'https:',
  host: githubHost,
  pathname: githubPath,
});
const githubHeaders = {
  Accept: 'application/vnd.github.VERSION.raw',
  'User-Agent': 'lovetingyuan/fq',
};
module.exports = {
  githubHost,
  githubPath,
  dirName,
  githubBaseUrl,
  githubHeaders,
};
