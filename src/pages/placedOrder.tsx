import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonIcon, IonRouterLink, IonButton, IonAlert, IonBackButton, IonButtons } from '@ionic/react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from './firebase'; // Import firebase auth
import { arrowBackCircle } from 'ionicons/icons';
import './placedOrders.css'; // Import CSS for styling

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the user ID state
      } else {
        setUserId('');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (userId) {
      const q = query(collection(db, 'orders'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersList: any[] = [];
        querySnapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() });
        });
        setOrders(ordersList);
      });

      return unsubscribe;
    }
  }, [userId]);

  const handleCancelOrder = async () => {
    if (selectedOrder) {
      try {
        await deleteDoc(doc(db, 'orders', selectedOrder.id));
        setShowConfirm(false);
        setShowAlert(true); // Show alert for successful cancellation
      } catch (error) {
        console.error('Error removing document: ', error);
      }
    }
  };

  if (orders.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
          <IonButtons slot='start'>
              <IonBackButton defaultHref='/Playfull-Bistro/home'/>
        </IonButtons>
            <IonTitle>My Orders</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-text-center">
          <div>
            <p>No order placed yet.</p>
            <IonButton routerLink="/PlayFull-Bistro/foodMenu" color="primary">Place Order Now</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonRouterLink href="/PlayFull-Bistro/homeUsers" className="back-button">
              <IonIcon id="arrow" aria-hidden="true" icon={arrowBackCircle} style={{ fontSize: '34px', marginRight: '10px' }} />
            </IonRouterLink>My Orders</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            {orders.map((order, index) => (
              <IonCol size="12" size-md="6" size-lg="4" key={index}>
                <IonCard className="order-card">
                  <img src={order.productImage} alt={order.productName} />
                  <IonCardHeader>
                    <IonCardTitle>{order.productName}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>Quantity: {order.quantity}</p>
                    <p>Product ID: {order.productId}</p>
                    <IonButton expand="block" color="danger" onClick={() => {
                      setSelectedOrder(order);
                      setShowConfirm(true);
                    }}>Cancel Order</IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonAlert
          isOpen={showConfirm}
          onDidDismiss={() => setShowConfirm(false)}
          header={'Confirm'}
          message={'Are you sure you want to cancel this order?'}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                setShowConfirm(false);
              }
            },
            {
              text: 'Yes',
              handler: handleCancelOrder
            }
          ]}
        />
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Success'}
          message={'Order cancelled successfully!'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Orders;
