import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonRouterLink,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonButton,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonAlert,
} from '@ionic/react';
import { arrowBackCircle } from 'ionicons/icons';
import { collection, query, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase'; // Import firebase auth
import './foodMenu.css';

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>(''); // State to store user ID

  useEffect(() => {
    // Get the current user
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
    const unsubscribe = onSnapshot(query(collection(db, 'products')), (querySnapshot) => {
      const productsList: any[] = [];
      querySnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsList);
    });
    return unsubscribe;
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrder = async () => {
    try {
      if (selectedProduct) {
        const orderData = {
          productName: selectedProduct.name,
          productId: selectedProduct.id,
          quantity: quantity,
          userId: userId, // Use the user ID state
          productImage: selectedProduct.image, // Include the image URL in order data
        };
  
        // Update the product quantity in Firestore
        const productRef = doc(db, 'products', selectedProduct.id);
        await updateDoc(productRef, {
          quantity: selectedProduct.quantity - quantity,
        });
  
        await addDoc(collection(db, 'orders'), orderData);
        setShowModal(false);
        setAlertMessage('Order placed successfully!');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error adding order:', error);
      setAlertMessage('Failed to place order. Please try again.');
      setShowAlert(true);
    }
  };
  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonRouterLink href="/PlayFull-Bistro/homeUsers" className="back-button">
              <IonIcon id="arrow" aria-hidden="true" icon={arrowBackCircle} style={{ fontSize: '34px', marginRight: '10px' }} />
            </IonRouterLink>Food Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSearchbar value={searchTerm} onIonChange={(e) => setSearchTerm(e.detail.value!)} placeholder="Search products..." />
        <IonGrid>
          <IonRow>
            {filteredProducts.map((product) => (
              <IonCol size="6" key={product.id} size-md="4" size-lg="3" size-xl="2">
                <IonCard>
                  <img src={product.image} alt={product.name} style={{ height: '200px', objectFit: 'cover' }} />
                  <IonCardHeader>
                    <IonCardTitle>{product.name}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>Price: ₱{product.price}</p>
                    <p>Quantity: {product.quantity}</p>
                    <p>Store: {product.store}</p>
                    <IonButton onClick={() => {
                      setSelectedProduct(product);
                      setShowModal(true);
                    }}>Place order</IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Select Quantity</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedProduct && (
              <div className="product-modal-content">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
                <p>{selectedProduct.name}</p>
                <p>Price: ₱{selectedProduct.price}</p>
              </div>
            )}
            <div className="product-modal-quantity">
              <IonItem>
                <IonLabel position="stacked">Quantity</IonLabel>
                <IonInput type="number" value={quantity} onIonChange={(e) => setQuantity(parseInt(e.detail.value!, 10))}></IonInput>
              </IonItem>
            </div>
            <div className="product-modal-button">
              <IonButton onClick={handleAddOrder}>Place order</IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Order Status'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Products;
