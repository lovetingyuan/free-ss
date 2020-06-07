import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonToast, IonLoading, IonCheckbox, IonIcon, IonNote } from '@ionic/react'
import './ExploreContainer.css';
import { Clipboard } from '@ionic-native/clipboard';
import { HTTP } from '@ionic-native/http';
import getConfig from './getConfig'
import { File } from '@ionic-native/file';
import { document as documentIcon } from 'ionicons/icons';
import { AppLauncher } from '@ionic-native/app-launcher';
import parseQR from './parseQR'

import fetchConfig from '../../../../lib/data'
import animation from './animation.json'
import "@lottiefiles/lottie-player"

interface ContainerProps {
  enabled: boolean
}

// server port password method
type Account = [string, number, string, string]

function getAccounts(type: 'string' | 'list') {
  return HTTP.get(fetchConfig.normal.url + '?_t=' + Date.now(), {}, {
    'user-agent': 'no-' + Math.random()
  }).then(res => {
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(res.data, 'text/html')
    const accounts = fetchConfig.normal.callback(doc)
    if (!accounts.length) {
      return Promise.reject()
    }
    if (type === 'list') {
      return accounts
    }
    return accounts.map(a => `ss://${btoa(a[3] + ':' + a[2])}@${a[0]}:${a[1]}`)
  })
}

function getAccountsByQR(type: 'list' | 'string') {
  return HTTP.get(fetchConfig.qrcode.url + '?_t=' + Date.now(), {}, {
    'user-agent': 'no-' + Math.random()
  }).then(res => {
    const uris = fetchConfig.qrcode.callback(res.data) as string[]
    const accounts: any[] = []
    return new Promise((resolve, reject) => {
      uris.forEach(base64 => {
        parseQR(base64).then((account: Account) => {
          accounts.push(account)
        }).catch(() => {
          accounts.push(null)
        }).finally(() => {
          if (accounts.length === uris.length) {
            const _accounts = accounts.filter(Boolean)
            if (!_accounts.length) {
              reject(new Error('暂无可用账号'))
            } else {
              if (type === 'list') {
                resolve(_accounts)
              } else {
                resolve(_accounts.map(a => `ss://${btoa(a[3] + ':' + a[2])}@${a[0]}:${a[1]}`))
              }
            }
          }
        })
      })
    })
  })
}

const ExploreContainer: React.FC<ContainerProps> = (props) => {
  const [[toastmsg, showtoast], setShowToast] = useState(['账号已经复制到粘贴板', false]);
  const [showLoading, setShowLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [ssinstalled, setssinstalled] = useState(false)
  const _exportfilepath = (File.externalApplicationStorageDirectory || '').split('0')[1] + 'ssaccounts.json'
  const [exportfilepath, setexportfilepath] = useState('')
  const coulduse = props.enabled
  const animatorRef = useRef(null);

  useEffect(() => {
    AppLauncher.canLaunch({
      packageName: 'com.github.shadowsocks'
    }).then(() => {
      setssinstalled(true)
    }).catch(() => {
      setssinstalled(false)
    });
    const headers = new Headers()
    headers.append('content-type', 'application/json')
    headers.append('accept', 'application/vnd.github.VERSION.raw')
    const player = document.querySelector("lottie-player") as any;
    setTimeout(() => {
      player.load(animation);
    })
  }, [])

  function handleclipboard() {
    if (!coulduse) {
      setShowToast(['APP暂时禁止使用', true])
      return
    }
    setShowLoading(true)
    getAccounts('string').catch(() => {
      return getAccountsByQR('string')
    }).then((accounts) => {
      return Clipboard.copy((accounts as string[]).join('\n'))
    }).then(() => {
      setShowToast(['账号已经复制到粘贴板', true])
    }).catch((err) => {
      setShowToast(['账号复制失败 ' + (err?.message || ''), true])
    }).finally(() => {
      setShowLoading(false)
    })
  }

  function handleexportfile() {
    if (!coulduse) {
      setShowToast(['APP暂时禁止使用', true])
      return
    }
    setShowLoading(true)
    setexportfilepath('')
    // File
    getAccounts('list').catch(() => {
      return getAccountsByQR('list')
    }).then((accounts) => {
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
      setShowToast(['导出文件失败 ' + (err?.message || ''), true])
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
    }
  }

  return (
    <div className="container">
      <div>
        <div ref={animatorRef}>
          <lottie-player background="transparent" speed="1" mode="normal"
            style={{ width: '100%', height: '18vh', margin: '0 auto' }} loop autoplay></lottie-player>
        </div>
        <br />
        <IonNote style={{ fontSize: '0.9em', color: '#555', textAlign: 'left' }}>
          免责声明：仅用于学习交流，禁止非法用途，否则一切风险后果自负。
          <p style={{ textAlign: 'center' }}>同意上述&nbsp;
          <IonCheckbox color="primary" style={{ verticalAlign: 'text-top' }} checked={checked}
              onIonChange={e => setChecked(e.detail.checked)} />
          </p>
        </IonNote>
        <br />
        <IonButton size="large" disabled={!checked} onClick={handleclipboard} color="success"
          expand="block" shape="round">复制到粘贴板
        </IonButton>
        <br />
        <IonButton size="large" disabled={!checked} onClick={handleexportfile} expand="block" shape="round">
          导出到文件
        </IonButton>
        <p style={{ textAlign: 'left' }} hidden={exportfilepath.length === 0}>
          <IonIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} icon={documentIcon}></IonIcon>{exportfilepath}
        </p>
      </div>
      <div>
        <IonButton className="ss" shape="round" disabled={!checked} onClick={handleOpenSS}>
          {ssinstalled ? '打开ShadowSocks' : <a style={{ color: 'white' }} href="https://github.com/shadowsocks/shadowsocks-android/releases" target="_blank" rel="noreferrer noopener">下载安装Shadowsocks</a>}
        </IonButton>
      </div>
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
