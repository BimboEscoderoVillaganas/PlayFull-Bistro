import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonIcon, IonRouterLink, IonButton, IonAlert, IonBackButton, IonButtons } from '@ionic/react';
import { collection, query, onSnapshot, getDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { arrowBackCircle } from 'ionicons/icons';
import './placedOrders.css';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailureAlert, setShowFailureAlert] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (querySnapshot) => {
      const ordersList: any[] = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ordersList);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchUserNames = async () => {
      const names: { [key: string]: string } = {};
      await Promise.all(orders.map(async (order) => {
        const userDoc = await getDoc(doc(db, 'users', order.userId));
        if (userDoc.exists()) {
          names[order.userId] = userDoc.data().name;
        } else {
          names[order.userId] = "Unknown";
        }
      }));
      setUserNames(names);
    };

    fetchUserNames();
  }, [orders]);

  const handlePickupOrder = async () => {
    const selectedOrder = orders.find(order => order.id === selectedOrderId);
    try {
      // Add to 'pickup' collection
      await addDoc(collection(db, 'pickup'), selectedOrder);

      // Add to 'sales' collection
      await addDoc(collection(db, 'sales'), selectedOrder);

      // Delete from 'orders' collection
      await deleteDoc(doc(db, 'orders', selectedOrderId));

      setShowConfirm(false);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error picking up order: ', error);
      setShowFailureAlert(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
              <IonBackButton defaultHref='/Playfull-Bistro/home'/>
        </IonButtons>
          <IonTitle>Orders</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {orders.length === 0 ? (
          <div className="ion-text-center">
            <p>No orders placed yet.</p>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {orders.map((order, index) => (
                <IonCol size="12" size-md="6" size-lg="4" key={index}>
                  <IonCard className="order-card">
                    <img src={order.productImage} alt={order.productName} />
                    <IonCardHeader>
                      <IonCardTitle className="order-card-title">{order.productName}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="order-card-content">
                      <p>Quantity: {order.quantity}</p>
                      <p className="order-card-user">User: {userNames[order.userId]}</p>
                      <IonButton expand="block" color="success" onClick={() => {
                        setSelectedOrderId(order.id);
                        setShowConfirm(true);
                      }}>Ready for Pickup</IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
        <IonAlert
          isOpen={showConfirm}
          onDidDismiss={() => setShowConfirm(false)}
          header={'Confirm'}
          message={'Is this order ready for pickup?'}
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
              handler: handlePickupOrder
            }
          ]}
        />
        <IonAlert
          isOpen={showSuccessAlert}
          onDidDismiss={() => setShowSuccessAlert(false)}
          header={'Success'}
          message={'Order picked up successfully!'}
          buttons={['OK']}
        />
        <IonAlert
          isOpen={showFailureAlert}
          onDidDismiss={() => setShowFailureAlert(false)}
          header={'Failure'}
          message={'Error picking up order. Please try again later.'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Orders;
