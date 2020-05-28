import React, { useState, useEffect } from 'react';
import { IonButton, IonToast, IonLoading, IonCheckbox, IonIcon } from '@ionic/react'
import './ExploreContainer.css';
import { Clipboard } from '@ionic-native/clipboard';
import { HTTP } from '@ionic-native/http';
import getConfig from './getConfig'
import { File } from '@ionic-native/file';
import { document as documentIcon } from 'ionicons/icons';
import { AppLauncher } from '@ionic-native/app-launcher';

import fetchData from '../../../../lib/data'

interface ContainerProps { }

// server port password method
type Account = [string, number, string, string]

function getAccounts(type: 'string' | 'list') {
  return HTTP.get(fetchData.url + '?_t=' + Date.now(), {}, {
    'user-agent': 'no-' + Math.random()
  }).then(res => {
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(res.data, 'text/html')
    const accounts = fetchData.callback(doc)
    if (type === 'list') {
      return accounts
    }
    return accounts.map(account => `ss://${btoa(account[3] + ':' + account[2])}@${account[0]}:${account[1]}`)
  })
}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const [[toastmsg, showtoast], setShowToast] = useState(['账号已经复制到粘贴板', false]);
  const [showLoading, setShowLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [ssinstalled, setssinstalled] = useState(false)
  const _exportfilepath = (File.externalApplicationStorageDirectory || '').split('0')[1] + 'ssaccounts.json'
  const [exportfilepath, setexportfilepath] = useState('')

  useEffect(() => {
    AppLauncher.canLaunch({
      packageName: 'com.github.shadowsocks'
    }).then(() => {
      setssinstalled(true)
    }).catch(() => {
      setssinstalled(false)
    });
  }, [])

  function handleclipboard() {
    setShowLoading(true)
    getAccounts('string').then((accounts) => {
      console.log(accounts)
      return Clipboard.copy(accounts.join('\n'))
    }).then(() => {
      setShowToast(['账号已经复制到粘贴板', true])
    }).catch((err) => {
      console.error(err)
      setShowToast(['账号复制失败', true])
    }).finally(() => {
      setShowLoading(false)
    })
  }

  function handleexportfile() {
    setShowLoading(true)
    setexportfilepath('')
    // File
    getAccounts('list').then((accounts) => {
      const _accounts = accounts as Account[]
      return File.writeFile(
        File.externalApplicationStorageDirectory,
        'ssaccounts.json',
        JSON.stringify(_accounts.map(getConfig), null, 2),
        {
          replace: true
        }
      )
    }).then(() => {
      setShowToast([`已经导出`, true])
      setexportfilepath(_exportfilepath)
    }).catch((err) => {
      console.error(err)
      setexportfilepath('导出文件失败')
      setShowToast(['导出文件失败', true])
    }).finally(() => {
      setShowLoading(false)
    })
  }

  const handleOpenSS = () => {
    // CustomNativePlugin.startSS()
    if (ssinstalled) {
      AppLauncher.launch({
        packageName: 'com.github.shadowsocks'
      })
    } else {
      setShowToast(['在浏览器下载Shadowsocks应用', true])
    }
  }

  return (
    <div className="container">
      <div>免责声明：仅用于学习交流，禁止非法用途，否则一切风险后果自负。
      <br />  同意上述&nbsp;
        <IonCheckbox color="primary" style={{verticalAlign: 'text-top'}} checked={checked}
          onIonChange={e => setChecked(e.detail.checked)} />
      </div>
      <br />
      <br />
      <IonButton size="large" disabled={!checked} onClick={handleclipboard} color="success"
        expand="block" shape="round">复制到粘贴板
      </IonButton>
      <br/>
      <IonButton size="large" disabled={!checked} onClick={handleexportfile} expand="block" shape="round">
        导出到文件
      </IonButton>
      <br/>
      <p style={{textAlign: 'left'}} hidden={exportfilepath.length == 0}>
        <IonIcon style={{verticalAlign: 'middle', marginRight: '8px'}} icon={documentIcon}></IonIcon>{exportfilepath}
      </p>
      <br/> <br/>
      <IonButton className="ss" shape="round" disabled={!checked} onClick={handleOpenSS}>
        {ssinstalled ? '打开ShadowSocks' : <a style={{color: 'white'}} href="https://github.com/shadowsocks/shadowsocks-android/releases" target="_blank" rel="noreferer noopener">下载安装Shadowsocks</a>}
      </IonButton>
      <IonToast
        isOpen={showtoast}
        onDidDismiss={() => setShowToast(['', false])}
        message={toastmsg}
        duration={900}
      />
      <IonLoading
        isOpen={showLoading}
        onDidDismiss={() => setShowLoading(false)}
        message="请稍候..."
      />
    </div>
  );
};

export default ExploreContainer;
