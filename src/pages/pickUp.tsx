import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonIcon, IonRouterLink, IonSpinner, IonButton, IonModal, IonTextarea, IonLabel, IonAlert,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { arrowBackCircle } from 'ionicons/icons';

const Products: React.FC = () => {
  const [pickupOrders, setPickupOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [successAlert, setSuccessAlert] = useState<boolean>(false);
  const [failureAlert, setFailureAlert] = useState<boolean>(false);

  useEffect(() => {
    const fetchPickupOrders = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const pickupQuery = query(collection(db, 'pickup'), where('userId', '==', currentUser.uid));
          const pickupSnapshot = await getDocs(pickupQuery);

          const pickupOrdersList: any[] = [];

          pickupSnapshot.forEach((doc) => {
            pickupOrdersList.push({ id: doc.id, ...doc.data() });
          });

          setPickupOrders(pickupOrdersList);
        } else {
          setError('User not authenticated.');
        }
      } catch (error) {
        console.error('Error fetching pickup orders: ', error);
        setError('Failed to fetch pickup orders.');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchPickupOrders();
      } else {
        setError('User not authenticated.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'pickup', orderId));
      console.log(`Order ${orderId} deleted successfully.`);
      setPickupOrders(prevOrders => prevOrders.filter(order => order.id !== orderId)); // Remove deleted order from state
      setSuccessAlert(true);
    } catch (error) {
      console.error('Error deleting order: ', error);
      setError('Failed to delete order.');
      setFailureAlert(true);
    }
  };

  const handleSendFeedback = async () => {
    try {
      if (selectedOrder) {
        await addDoc(collection(db, 'feedback'), {
          orderId: selectedOrder.id,
          productId: selectedOrder.productId,
          userId: selectedOrder.userId,
          feedback: feedback,
        });
        console.log(`Feedback for order ${selectedOrder.id} sent successfully.`);
        // Only delete the pickup order if selectedOrder is not null
        await deleteDoc(doc(db, 'pickup', selectedOrder.id));
        console.log(`Order ${selectedOrder.id} deleted after feedback.`);
        setPickupOrders(pickupOrders.filter(order => order.id !== selectedOrder.id)); // Remove feedback sent order from state
        setFeedback('');
        setShowFeedbackModal(false);
        setSuccessAlert(true);
      }
    } catch (error) {
      console.error('Error sending feedback: ', error);
      setError('Failed to send feedback.');
      setFailureAlert(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
              <IonBackButton defaultHref='/Playfull-Bistro/home'/>
        </IonButtons>
          <IonTitle>For Pick Up</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading ? (
          <div className="ion-text-center">
            <IonSpinner name="crescent" />
          </div>
        ) : error ? (
          <div className="ion-text-center">
            <p>{error}</p>
          </div>
        ) : pickupOrders.length === 0 ? (
          <div className="ion-text-center">
            <p>No orders ready for pickup.</p>
            <IonButton routerLink="/PlayFull-Bistro/placedOrder" color="primary">View Orders</IonButton>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {pickupOrders.map((order, index) => (
                <IonCol size="12" size-md="6" size-lg="4" key={index}>
                  <IonCard>
                    <img src={order.productImage} alt={order.productName} />
                    <IonCardHeader>
                      <IonCardTitle>{order.productName}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>Order ID: {order.id}</p>
                      <p>Product ID: {order.productId}</p>
                      <p>Quantity: {order.quantity}</p>
                      <p>User ID: {order.userId}</p>
                      <IonButton
                        expand="block"
                        color="danger"
                        onClick={() => handleDelete(order.id)}
                      >
                        Delete
                      </IonButton>
                      <IonButton
                        expand="block"
                        color="primary"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowFeedbackModal(true);
                        }}
                      >
                        Send Feedback
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}

        <IonModal isOpen={showFeedbackModal} onDidDismiss={() => setShowFeedbackModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Send Feedback</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="ion-padding">
              <IonLabel>Feedback</IonLabel>
              <IonTextarea
                value={feedback}
                onIonChange={(e) => setFeedback(e.detail.value!)}
                placeholder="Enter your feedback here"
              />
              <IonButton expand="block" color="primary" onClick={handleSendFeedback}>
                Submit Feedback
              </IonButton>
              <IonButton expand="block" color="medium" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={successAlert}
          onDidDismiss={() => setSuccessAlert(false)}
          header={'Success'}
          message={'Action was successful!'}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={failureAlert}
          onDidDismiss={() => setFailureAlert(false)}
          header={'Error'}
          message={'Action failed. Please try again later.'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Products;
