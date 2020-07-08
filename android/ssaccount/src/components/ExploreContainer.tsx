import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonLoading, IonCheckbox, IonIcon, IonNote } from '@ionic/react'
import './ExploreContainer.css';
import { Plugins } from '@capacitor/core';

import { HTTP } from '@ionic-native/http';
import { AppLauncher } from '@ionic-native/app-launcher';

import providers from '../../../../lib/browser'
import animation from './animation.json'
import { copyOutline as copyicon } from 'ionicons/icons'

import "@lottiefiles/lottie-player"

const { Clipboard, Toast } = Plugins;

interface ContainerProps {
  enabled: boolean
}

const ExploreContainer: React.FC<ContainerProps> = (props) => {
  const [showLoading, setShowLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [ssinstalled, setssinstalled] = useState(false)
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
    const player = document.querySelector("lottie-player") as any;
    setTimeout(() => {
      player.load(animation);
    })
  }, [])

  const getRequest = (url: string, headers: any) => {
    const _url = new URL(url)
    return HTTP.get(url, {}, Object.assign({
      'User-Agent': 'ionic-' + Date.now(),
      'Host': _url.host,
    }, headers)).then(res => {
      if (res.status === 200) {
        return res.data
      }
      return ''
    })
  }

  function fetchAllAccounts() {
    return Promise.all(providers.map((provider) => {
      return provider(getRequest).then(accounts => {
        return accounts.map(a => `ss://${btoa(a.method + ':' + a.password)}@${a.server}:${a.port}`)
      }).catch(() => [])
    })).then((accountsList: string[][]) => {
      return accountsList.reduce((a, b) => a.concat(b), [])
    })
  }

  function handleclipboard() {
    if (!coulduse) {
      Toast.show({
        text: 'APP暂时禁止使用'
      });
      return
    }
    setShowLoading(true)
    fetchAllAccounts().then((accounts) => {
      if (accounts.length) {
        return Clipboard.write({
          string: (accounts as string[]).join('\n')
        }).then(() => accounts.length)
      }
      Toast.show({
        text: '账号获取失败'
      });
    }).then((num) => {
      Toast.show({
        text: '账号已经复制到粘贴板(' + num + ')'
      });
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
          expand="block" shape="round">
            <IonIcon style={{verticalAlign: 'middle'}} icon={copyicon}></IonIcon>
            &nbsp;
            复制到粘贴板
        </IonButton>
      </div>
      <div>
        <IonButton className="ss" shape="round" disabled={!checked} onClick={handleOpenSS}>
          {ssinstalled ? '打开ShadowSocks' : <a style={{ color: 'white' }} href="https://github.com/shadowsocks/shadowsocks-android/releases" target="_blank" rel="noreferrer noopener">下载安装Shadowsocks</a>}
        </IonButton>
      </div>
      <IonLoading
        isOpen={showLoading}
        onDidDismiss={() => setShowLoading(false)}
        message="请耐心等待..."
      />
    </div>
  );
};

export default ExploreContainer;
