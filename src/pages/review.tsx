import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonRouterLink, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSpinner, IonButton, IonAlert, IonBackButton, IonButtons } from '@ionic/react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { arrowBackCircle, trash } from 'ionicons/icons';

const Products: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<any | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackQuerySnapshot = await getDocs(collection(db, 'feedback'));
        const feedbackList: any[] = [];
        feedbackQuerySnapshot.forEach((doc) => {
          feedbackList.push({ id: doc.id, ...doc.data() });
        });
        setFeedbacks(feedbackList);
      } catch (error) {
        console.error('Error fetching feedback: ', error);
        setError('Failed to fetch feedback.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleDelete = async () => {
    try {
      if (feedbackToDelete) {
        await deleteDoc(doc(db, 'feedback', feedbackToDelete.id));
        setFeedbacks(feedbacks.filter(feedback => feedback.id !== feedbackToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting feedback: ', error);
      // Handle error
    } finally {
      setFeedbackToDelete(null);
      setShowDeleteAlert(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
              <IonBackButton defaultHref='/Playfull-Bistro/home'/>
        </IonButtons>
          <IonTitle>Review
          </IonTitle>
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
        ) : feedbacks.length === 0 ? (
          <div className="ion-text-center">
            <p>No feedback available.</p>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {feedbacks.map((feedback, index) => (
                <IonCol size="12" size-md="6" size-lg="4" key={index}>
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Feedback for Order ID: {feedback.orderId}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>Product ID: {feedback.productId}</p>
                      <p>User ID: {feedback.userId}</p>
                      <p>Feedback: {feedback.feedback}</p>
                      <IonButton onClick={() => { setFeedbackToDelete(feedback); setShowDeleteAlert(true); }} color="danger">
                        <IonIcon icon={trash} />
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Delete Feedback'}
          message={'Are you sure you want to delete this feedback?'}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                setShowDeleteAlert(false);
              }
            },
            {
              text: 'Delete',
              handler: () => {
                handleDelete();
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Products;
