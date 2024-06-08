import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonAlert,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonRouterLink,
} from '@ionic/react';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { trash, pencil, arrowBackCircle } from 'ionicons/icons'; // Import icons
import './products.css'; // Import CSS for styling
import { signOut } from 'firebase/auth';
import { useHistory } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  image: string;
  quantity: number;
  store: string;
  price: number;
}

const Products: React.FC = () => {
  const [productName, setProductName] = useState<string>('');
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [storeName, setStoreName] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const history = useHistory();

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsList: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsList);
    });
    return unsubscribe;
  }, []);

  const handleAddProduct = async () => {
    try {
      await addDoc(collection(db, 'products'), {
        name: productName,
        image: imageUrl,
        quantity: quantity,
        store: storeName,
        price: price,
      });

      setAlertMessage('Product added successfully');
      setShowAlert(true);
      // Clear the form
      setProductName('');
      setImageUrl('');
      setQuantity(0);
      setStoreName('');
      setPrice(0);
    } catch (error) {
      setAlertMessage('Error adding product: ' + error.message);
      setShowAlert(true);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setAlertMessage('Product deleted successfully');
      setShowAlert(true);
    } catch (error) {
      setAlertMessage('Error deleting product: ' + error.message);
      setShowAlert(true);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setImageUrl(product.image);
    setQuantity(product.quantity);
    setStoreName(product.store);
    setPrice(product.price);
  };

  const handleUpdateProduct = async () => {
    try {
      if (selectedProduct) {
        await updateDoc(doc(db, 'products', selectedProduct.id), {
          name: productName,
          image: imageUrl,
          quantity: quantity,
          store: storeName,
          price: price,
        });

        setAlertMessage('Product updated successfully');
        setShowAlert(true);
        // Clear the form
        setSelectedProduct(null);
        setProductName('');
        setImageUrl('');
        setQuantity(0);
        setStoreName('');
        setPrice(0);
      }
    } catch (error) {
      setAlertMessage('Error updating product: ' + error.message);
      setShowAlert(true);
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonRouterLink href="/PlayFull-Bistro/Home" className="back-button">
              <IonIcon id="arrow" aria-hidden="true" icon={arrowBackCircle} style={{ fontSize: '34px', marginRight: '10px' }} />
            </IonRouterLink>
            Products
          </IonTitle>
          <IonButton slot="end" onClick={() => setShowLogoutAlert(true)} className="custom-button">Logout</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="products-container"><br /><br /><br /><br /><br /><br />
          <IonItem>
            <IonLabel position="stacked">Search Products</IonLabel>
            <IonInput
              value={searchTerm}
              onIonChange={(e) => setSearchTerm(e.detail.value!)}
              placeholder="Enter search term"
            />
          </IonItem>
          <div className="product-form">
            <IonItem>
              <IonLabel position="stacked">Product Name</IonLabel>
              <IonInput
                value={productName}
                onIonChange={(e) => setProductName(e.detail.value!)}
                placeholder="Enter product name"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Image URL</IonLabel>
              <IonInput
                value={imageUrl}
                onIonChange={(e) => setImageUrl(e.detail.value!)}
                placeholder="Enter image URL"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Quantity</IonLabel>
              <IonInput
                value={quantity}
                type="number"
                onIonChange={(e) => setQuantity(parseInt(e.detail.value!, 10))}
                placeholder="Enter quantity"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Store Name</IonLabel>
              <IonInput
                value={storeName}
                onIonChange={(e) => setStoreName(e.detail.value!)}
                placeholder="Enter store name"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Price (₱)</IonLabel>
              <IonInput
                value={price}
                type="number"
                onIonChange={(e) => setPrice(parseFloat(e.detail.value!))}
                placeholder="Enter price"
              />
            </IonItem>
            <IonButton expand="block" onClick={selectedProduct ? handleUpdateProduct : handleAddProduct}>
              {selectedProduct ? 'Update Product' : 'Add Product'}
            </IonButton>
          </div>
          <div className="products-list">
            {filteredProducts.map((product) => (
              <IonCard key={product.id}>
                <img src={product.image} alt={product.name} className="product-image" />
                <IonCardHeader>
                  <IonCardTitle>{product.name}</IonCardTitle>
                  <IonCardSubtitle>{product.store}</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Price: ₱{product.price}</p>
                  <p>Quantity: {product.quantity}</p>
                  <IonButton color="danger" onClick={() => handleDeleteProduct(product.id)}>
                    <IonIcon icon={trash} slot="icon-only" />
                  </IonButton>
                  <IonButton color="primary" onClick={() => handleEditProduct(product)}>
                    <IonIcon icon={pencil} slot="icon-only" />
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Alert'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)}
        header={`Confirm Logout`}
        message={`Are you sure you want to logout?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setShowLogoutAlert(false);
            },
          },
          {
            text: 'Logout',
            handler: handleLogout,
            cssClass: 'custom-button-blue',
          },
        ]}
      />
    </IonPage>
  );
};

export default Products;
