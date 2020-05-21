import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { paperPlane } from 'ionicons/icons'

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            SS-Accounts &nbsp;
            <IonIcon style={{verticalAlign: 'middle'}} icon={paperPlane}></IonIcon>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
