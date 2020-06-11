import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { paperPlane } from 'ionicons/icons'
import pkg from '../../package.json'

const Home: React.FC = () => {
  const [updateLink, setUpdateLink] = useState('')
  const [enabled, setenabled] = useState(true)

  useEffect(() => {
    const headers = new Headers()
    headers.append('content-type', 'application/json')
    headers.append('accept', 'application/vnd.github.VERSION.raw')
    fetch('https://api.github.com/repos/lovetingyuan/free-ss/contents/android/ssaccount/package.json', {
      headers
    }).then(res => res.json()).then(res => {
      if (pkg.version !== res.version) {
        setUpdateLink(`https://github.com/lovetingyuan/free-ss/blob/master/android/ssaccount-${res.version}.apk`)
      }
      if ((pkg as any).enabled === false) {
        setenabled(false)
      }
    }).catch(() => {
      // console.log(err)
    })
  }, [])
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {
            updateLink ? <a className="update-link" target="_blank"
              rel="noreferrer noopener" href={updateLink} slot="primary">更新</a> : null
          }
          <IonTitle>
            SS-Accounts &nbsp;
            <IonIcon style={{verticalAlign: 'middle'}} icon={paperPlane}></IonIcon>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ExploreContainer enabled={enabled} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
