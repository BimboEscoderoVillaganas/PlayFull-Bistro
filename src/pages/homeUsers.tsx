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
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { cart, pencil, clipboard } from 'ionicons/icons';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [totalPlacedOrders, setTotalPlacedOrders] = useState<number | null>(null);
  const [totalReadyForPickup, setTotalReadyForPickup] = useState<number | null>(null);
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        history.push('/PlayFull-Bistro/login');
      } else {
        fetchUserName(user.uid);
        fetchTotalPlacedOrders(user.uid);
        fetchTotalReadyForPickup(user.uid);
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

  const fetchTotalPlacedOrders = async (userId: string) => {
    try {
      const placedOrdersCollectionRef = collection(db, 'orders');
      const q = query(placedOrdersCollectionRef, where('userId', '==', userId));
      const placedOrdersSnapshot = await getDocs(q);
      setTotalPlacedOrders(placedOrdersSnapshot.size);
    } catch (error) {
      console.error('Error fetching total placed orders: ', error);
    }
  };

  const fetchTotalReadyForPickup = async (userId: string) => {
    try {
      const readyForPickupCollectionRef = collection(db, 'pickup');
      const q = query(readyForPickupCollectionRef, where('userId', '==', userId));
      const readyForPickupSnapshot = await getDocs(q);
      setTotalReadyForPickup(readyForPickupSnapshot.size);
    } catch (error) {
      console.error('Error fetching total ready for pickup orders: ', error);
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
      title: 'Food Menu',
      icon: cart,
      subtitle: 'Applet #1',
      link: '/PlayFull-Bistro/foodMenu'
    },
    {
      title: 'Placed Orders',
      icon: clipboard,
      subtitle: 'Applet #2',
      link: '/PlayFull-Bistro/placedOrder',
      notification: totalPlacedOrders
    },
    {
      title: 'Ready For Pick Up',
      icon: pencil,
      subtitle: 'Applet #3',
      link: '/PlayFull-Bistro/pickUp',
      notification: totalReadyForPickup
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
        <h2>Welcome User, {userName}!</h2>
        <p>This is your user home page.</p>
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
                        {(card.title === 'Placed Orders' || card.title === 'Ready For Pick Up') && typeof card.notification === 'number' && card.notification > 0 && (
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
