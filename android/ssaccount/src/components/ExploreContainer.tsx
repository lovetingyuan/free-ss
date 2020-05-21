import React, { useState } from 'react';
import { IonButton, IonToast, IonLoading, IonCheckbox, IonIcon } from '@ionic/react'
import './ExploreContainer.css';
import { Clipboard } from '@ionic-native/clipboard';
import { HTTP } from '@ionic-native/http';
import getConfig from './getConfig'
import { File } from '@ionic-native/file';
import { Plugins } from "@capacitor/core";
import { document as documentIcon } from 'ionicons/icons';

interface ContainerProps { }

// server port password method
type Account = [string, number, string, string]

const { CustomNativePlugin } = Plugins;

// console.log(CustomNativePlugin.customCall().then((re: any) => {
// console.log(998, re)
// }),  CustomNativePlugin.customFunction().then((re: any) => {
//   console.log(88, re)
// }))

function getAccounts(type: 'string' | 'list') {
  return HTTP.get('https://my.ishadowx.biz/?_t=' + Date.now(), {}, {
    'user-agent': 'no-' + Date.now()
  }).then(res => {
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(res.data, 'text/html')
    const items = [...doc.querySelectorAll('.portfolio-item')]
    const accounts: (string | Account)[] = []
    items.forEach(item => {
      const account: Account = [] as any
      item.querySelectorAll('h4').forEach((h4, i) => {
        if (!h4) return
        const value = ((h4 as HTMLElement).textContent as string).split(':')[1]
        if (value) {
          account.push(i === 1 ? parseInt(value.trim(), 10) : value.trim())
        }
      })
      if (account.length === 4) {
        //  server port password method
        if (type === 'string') {
          const ssurl = `ss://${btoa(account[3] + ':' + account[2])}@${account[0]}:${account[1]}`
          accounts.push(ssurl)
        } else {
          accounts.push(account)
        }
      }
    })
    return accounts
  })
}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const [[toastmsg, showtoast], setShowToast] = useState(['账号已经复制到粘贴板', false]);
  const [showLoading, setShowLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  function handleclipboard() {
    setShowLoading(true)
    getAccounts('string').then((accounts) => {
      return Clipboard.copy(accounts.join('\n'))
    }).then(() => {
      setShowToast(['账号已经复制到粘贴板', true])
    }).catch(() => {
      setShowToast(['账号复制失败', true])
    }).finally(() => {
      setShowLoading(false)
    })
  }
  const exportfilepath = File.externalApplicationStorageDirectory.split('0')[1] + 'ssaccounts.json'

  function handleexportfile() {
    setShowLoading(true)
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
    }).catch((err) => {
      console.error(err)
      setShowToast(['导出文件失败', true])
    }).finally(() => {
      setShowLoading(false)
    })
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
      <p style={{textAlign: 'left'}}>
        <IonIcon style={{verticalAlign: 'middle', marginRight: '8px'}} icon={documentIcon}></IonIcon>{exportfilepath}
      </p>
      <br/> <br/>
      <IonButton className="ss" shape="round" disabled={!checked} onClick={() => CustomNativePlugin.startSS()}>打开ShadowSocks</IonButton>
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
