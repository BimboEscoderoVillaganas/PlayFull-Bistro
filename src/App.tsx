import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/login';
import Tab2 from './pages/signup';
import Tab3 from './pages/home';
import Tab4 from './pages/sell';
import Tab5 from './pages/products';
import Tab6 from './pages/review';
import Tab7 from './pages/homeUsers';
import Tab8 from './pages/orders';
import Tab9 from './pages/foodMenu';
import Tab11 from './pages/placedOrder';
import Tab10 from './pages/pickUp';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/PlayFull-Bistro/login">
            <Tab1 />
          </Route>
          <Route exact path="/PlayFull-Bistro/signup">
            <Tab2 />
          </Route>
          <Route path="/PlayFull-Bistro/home">
            <Tab3 />
          </Route><Route path="/PlayFull-Bistro/homeUsers">
            <Tab7 />
          </Route>
          <Route path="/PlayFull-Bistro/sell">
            <Tab4 />
          </Route>
          <Route path="/PlayFull-Bistro/review">
            <Tab6 />
          </Route>
          <Route path="/PlayFull-Bistro/products">
            <Tab5/>
          </Route>
          <Route path="/PlayFull-Bistro/orders">
            <Tab8/>
          </Route>
          <Route path="/PlayFull-Bistro/foodMenu">
            <Tab9/>
          </Route>
          <Route path="/PlayFull-Bistro/placedOrder">
            <Tab11/>
          </Route>
          <Route path="/PlayFull-Bistro/pickUp">
            <Tab10/>
          </Route>
          <Route exact path="/PlayFull-Bistro/">
            <Redirect to="/PlayFull-Bistro/login" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
