import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonToast, IonLoading, IonCheckbox, IonNote } from '@ionic/react'
import './ExploreContainer.css';
import { Clipboard } from '@ionic-native/clipboard';
import { HTTP } from '@ionic-native/http';
import { AppLauncher } from '@ionic-native/app-launcher';

import providers from '../../../../lib/browser'
import animation from './animation.json'
import "@lottiefiles/lottie-player"

interface ContainerProps {
  enabled: boolean
}

const ExploreContainer: React.FC<ContainerProps> = (props) => {
  const [[toastmsg, showtoast], setShowToast] = useState(['账号已经复制到粘贴板', false]);
  const [showLoading, setShowLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [ssinstalled, setssinstalled] = useState(false)
  // const _exportfilepath = (File.externalApplicationStorageDirectory || '').split('0')[1] + 'ssaccounts.json'
  // const [exportfilepath, setexportfilepath] = useState('')
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

  function fetchAllAccounts () {
    return Promise.all(providers.map(({ url, callback }) => {
      return HTTP.get(url + '?_t=' + Date.now(), {}, {
        'user-agent': 'ionic-' + Math.random()
      }).then(res => {
        return callback(res.data) as Account[] // accounts may be promise
      }).then(accounts => {
        return accounts.map(a => `ss://${btoa(a.method + ':' + a.password)}@${a.server}:${a.port}`)
      })
    })).then(([accounts1, accounts2]) => {
      return accounts1.concat(accounts2)
    })
  }

  function handleclipboard() {
    if (!coulduse) {
      setShowToast(['APP暂时禁止使用', true])
      return
    }
    setShowLoading(true)
    fetchAllAccounts().then((accounts) => {
      if (!accounts.length) {
        setShowToast(['账号复制失败', true])
        return
      }
      return Clipboard.copy((accounts as string[]).join('\n'))
    }).then(() => {
      setShowToast(['账号已经复制到粘贴板', true])
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
            style={{ width: '100%', height: '20vh', margin: '0 auto' }} loop autoplay></lottie-player>
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
        <br />
        <IonButton size="large" disabled={!checked} onClick={handleclipboard} color="success"
          expand="block" shape="round">复制到粘贴板
        </IonButton>
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
        message="请耐心等待..."
      />
    </div>
  );
};

export default ExploreContainer;
