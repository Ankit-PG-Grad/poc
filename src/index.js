import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Create root element for React application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Service Worker Registration
 * Register the service worker to enable PWA functionality.
 * This enables:
 * - Offline functionality
 * - Faster loading through caching
 * - Background sync
 * - Push notifications (if implemented)
 * 
 * Note: Service worker only works in production build and over HTTPS
 * (except for localhost during development)
 */
serviceWorkerRegistration.register();
