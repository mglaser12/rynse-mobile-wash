
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/mapbox.css'; // Import mapbox styles
import { AppProviders } from './providers/AppProviders';
import { registerServiceWorker } from './registerServiceWorker';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);

registerServiceWorker();
