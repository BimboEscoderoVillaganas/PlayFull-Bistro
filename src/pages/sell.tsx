import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonRouterLink, IonBackButton, IonButtons } from '@ionic/react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { arrowBackCircle } from 'ionicons/icons';

const Products: React.FC = () => {
  const [totalSales, setTotalSales] = useState<number | null>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const salesCollection = collection(db, 'sales');
        const salesSnapshot = await getDocs(salesCollection);
        let total = 0;
        for (const saleDoc of salesSnapshot.docs) {
          const saleData = saleDoc.data();
          const productDoc = await getDoc(doc(db, 'products', saleData.productId));
          if (productDoc.exists()) {
            const productData = productDoc.data();
            const amount = productData.price * saleData.quantity;
            total += amount;
          }
        }
        setTotalSales(total);
      } catch (error) {
        console.error('Error fetching sales data: ', error);
        setTotalSales(null);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
              <IonBackButton defaultHref='/Playfull-Bistro/home'/>
        </IonButtons>
          <IonTitle>Sale</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          {totalSales !== null ? (
            <h2>Total Sales Amount: ₱{totalSales.toFixed(2)}</h2>
          ) : (
            <p>Loading sales data...</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Products;
