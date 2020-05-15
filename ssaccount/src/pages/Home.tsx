import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ss-account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
