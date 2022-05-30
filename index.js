#! /usr/bin/node
const fetch = require('node-fetch');
// const clipboardy = require('clipboardy');
const childProcess = require('child_process');
const path = require('path');
const { createDocument } = require('domino');
const fs = require('fs');
const ssDir = path.resolve(__dirname, 'shadowsocks');

const atob = a => {
  return Buffer.from(a, 'base64').toString('utf-8');
};
const request = url => {
  return fetch(url).then(r => {
    if (r.ok) return r.text();
    return Promise.reject(`fetch error: ${r.status}, ${r.statusText}`);
  });
};

function getAccount(url) {
  let method, password, server, port, remarks;
  if (typeof url === 'string') {
    url = url.slice('ss://'.length);
    const [mp, sp, _remarks = ''] = url.split(/@|#/);
    [method, password] = atob(mp).split(':');
    [server, port] = sp.split(':');
    remarks = _remarks;
  } else {
    ({ method, password, server, port, remarks } = url);
  }

  return {
    server,
    server_port: Number(port),
    password,
    method,
    remarks: decodeURIComponent(remarks),
    timeout: 20,
    warnLegacyUrl: false,
  };
}

function updateAccounts(accounts) {
  const configFile = path.resolve(ssDir, 'gui-config.json');
  if (!fs.existsSync(configFile)) {
    console.log('no shadowsocks config file, please run ss client first.');
    restartClient();
    setTimeout(() => {
      process.exit(0);
    });
  } else {
    const config = require(configFile);
    config.configs = accounts;
    config.enabled = true;
    console.log('updating ss config...');
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  }
}

function restartClient(first) {
  if (process.platform !== 'win32') {
    console.log('only support windows currently.');
    return;
  }
  const ssbinName = 'Shadowsocks.exe';
  const ssbinPath = path.resolve(ssDir, ssbinName);
  const ret = childProcess
    .execSync(`tasklist /FI "IMAGENAME eq ${ssbinName}" /FO csv /NH`)
    .toString('utf8');
  if (ret.includes(ssbinName)) {
    console.log('closing current client...');
    const targetProcess = ret.toString('utf8').trim().split('\r\n');
    if (targetProcess.length) {
      const pid = targetProcess[0].split(',').map(v => v.trim())[1];
      const _pid = Number.parseInt(JSON.parse(pid), 10);
      if (!Number.isNaN(_pid)) {
        process.kill(_pid, 'SIGINT');
      }
    }
    console.log('restarting ss client...');
  } else {
    console.log('starting ss client...');
  }
  return childProcess.spawn(ssbinPath, {
    detached: true,
  });
}

async function fetchAccounts() {
  console.log('start fetching accounts...');
  const task1 = request('https://raw.fastgit.org/freefq/free/master/v2').then(r => {
    const str = atob(r);
    const ssAccounts = str.split('\n').filter(a => a.startsWith('ss://'));
    // clipboardy.writeSync(ssAccounts.join('\n'));
    return ssAccounts.map(getAccount);
  });
  const task2 = request('https://3.weiwei.in/2020.html').then(htmlStr => {
    if (!htmlStr) return [];
    const doc = createDocument(htmlStr);
    return Array.from(doc.querySelectorAll('table tr'))
      .map(tr => {
        const tds = Array.from(tr.querySelectorAll('td'));
        if (tds.length < 4) return;
        const [server, port, method, password] = tds.slice(0, 4).map(td => td.textContent.trim());
        return getAccount({ server, port, method, password, remarks: 'weiwei.in' });
      })
      .filter(Boolean);
  });
  return Promise.all([task1, task2]).then(([a, b]) => a.concat(b));
}

function main() {
  return fetchAccounts()
    .then(accounts => {
      if (accounts) {
        console.log(`fetched ${accounts.length} accounts.`);
        updateAccounts(accounts);
        restartClient();
        console.log('done, quit after 3 seconds.');
        setTimeout(() => {
          process.exit(0);
        }, 3000);
      } else {
        return Promise.reject(new Error('no availabel accounts'));
      }
    })
    .catch(err => {
      const msg = err instanceof Error ? err.message : err ? err.toString() : 'unknown reason.';
      console.error('failed, ' + msg);
    });
}

main();
