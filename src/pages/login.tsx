import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonButton,
  IonAlert,
} from "@ionic/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useHistory } from "react-router-dom";
import "./login.css"; // Import the CSS file
import welcomeImage from "./images/icon.png"; // Import the image

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null); // State for welcome message
  const [users, setUsers] = useState<Array<any>>([]); // State to store logged-in users
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // User exists, add to logged-in users
        const userData = docSnap.data();
        setUsers((prevUsers) => [...prevUsers, { uid: user.uid, ...userData }]);
        setWelcomeMessage(`Welcome ${userData.name}`);
        setShowAlert(true);

        // Determine the user's type and redirect accordingly
        const usertype = userData.usertype;
        setTimeout(() => {
          if (usertype === "admin") {
            history.push("/PlayFull-Bistro/home");
          } else if (usertype === "user" || !usertype) {
            history.push("/PlayFull-Bistro/homeUsers");
          }
        }, 3000); // Redirect after 3 seconds
      } else {
        // User does not exist, show alert
        setShowAlert(true);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignup = () => {
    history.push("/PlayFull-Bistro/signup");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="welcome-container">
          <img src={welcomeImage} alt="Welcome" className="welcome-image" />
          <h1 className="welcome-text">Welcome Back</h1>
        </div>
        <IonItem>
          <IonInput
            placeholder="Email"
            value={email}
            type="email"
            onIonChange={(e) => setEmail(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            placeholder="Password"
            value={password}
            type="password"
            onIonChange={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="button-group">
          <IonButton className="login-button" onClick={handleLogin}>
            Login
          </IonButton>
        </div>
        <div className="signup-text">
          Don't have an account? <span onClick={handleSignup}>Sign Up</span>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={"Alert"}
          message={welcomeMessage || "User does not exist"} // Display welcome message or default message
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
