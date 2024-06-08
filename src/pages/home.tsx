import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonAlert,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonIcon,
  IonRow,
  IonSearchbar,
  IonBadge
} from '@ionic/react';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { useHistory } from 'react-router-dom';
import './home.css'; // Import the CSS file
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { cart, pencil, pulse, clipboard } from 'ionicons/icons';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [totalFeedbacks, setTotalFeedbacks] = useState<number | null>(null);
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        history.push('/PlayFull-Bistro/login');
      } else {
        fetchUserName(user.uid);
        fetchTotalOrders();
        fetchTotalFeedbacks();
      }
    });

    return unsubscribe;
  }, [history]);

  const fetchUserName = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserName(userData.name);
      }
    } catch (error) {
      console.error('Error fetching user name: ', error);
    }
  };

  const fetchTotalOrders = async () => {
    try {
      const ordersCollectionRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersCollectionRef);
      setTotalOrders(ordersSnapshot.size);
    } catch (error) {
      console.error('Error fetching total orders: ', error);
    }
  };

  const fetchTotalFeedbacks = async () => {
    try {
      const feedbackCollectionRef = collection(db, 'feedback');
      const feedbackSnapshot = await getDocs(feedbackCollectionRef);
      setTotalFeedbacks(feedbackSnapshot.size);
    } catch (error) {
      console.error('Error fetching total feedbacks: ', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push('/PlayFull-Bistro/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const cardData = [
    {
      title: 'Products',
      icon: cart,
      subtitle: 'Applet #1',
      link: '/PlayFull-Bistro/products'
    },
    {
      title: 'Orders',
      icon: clipboard,
      subtitle: 'Applet #2',
      link: '/PlayFull-Bistro/orders',
      notification: totalOrders
    },
    {
      title: 'Sales',
      icon: pulse,
      subtitle: 'Applet #3',
      link: '/PlayFull-Bistro/sell'
    },
    {
      title: 'Feedback',
      icon: pencil,
      subtitle: 'Applet #4',
      link: '/PlayFull-Bistro/review',
      notification: totalFeedbacks
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
          <IonButton slot="end" onClick={() => setShowLogoutAlert(true)} className="custom-button">Logout</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Welcome Admin, {userName}!</h2>
        <p>This is your admin home page.</p>
        <div id="card">
          <IonSearchbar
            value={searchTerm}
            onIonInput={(e) => setSearchTerm(e.detail.value!)}
          />
          {cardData
            .filter((card) => card.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((card, index) => (
              <IonCard key={index} routerLink={card.link} routerDirection='forward'>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="auto">
                          <IonIcon className="home-card-icon" icon={card.icon} color="primary" />
                        </IonCol>
                        <IonCol>
                          <div className="home-card-title">{card.title}</div>
                          <IonCardSubtitle>{card.subtitle}</IonCardSubtitle>
                        </IonCol>
                        {(card.title === 'Orders' || card.title === 'Feedback') && typeof card.notification === 'number' && card.notification > 0 && (
                          <IonCol size="auto">
                            <IonBadge color="danger">{card.notification}</IonBadge>
                          </IonCol>
                        )}
                      </IonRow>
                    </IonGrid>
                  </IonCardTitle>
                </IonCardHeader>
              </IonCard>
            ))}
        </div>
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header={`Confirm Logout`}
          message={`Are you sure you want to logout, ${userName}?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                setShowLogoutAlert(false);
              }
            },
            {
              text: 'Logout',
              handler: handleLogout,
              cssClass: 'custom-button-blue'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
