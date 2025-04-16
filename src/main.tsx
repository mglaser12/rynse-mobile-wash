
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, isRunningAsPWA, checkAssetsAccessible, recoverFromBrokenState } from './registerServiceWorker'

// Create a global variable to track app state
window.APP_INITIALIZED = false;

// Function to initialize the app with additional error handling
const initializeApp = async () => {
  try {
    // Check if assets are accessible when in PWA mode
    if (isRunningAsPWA()) {
      const assetsAccessible = await checkAssetsAccessible();
      if (!assetsAccessible) {
        console.error('Assets not accessible, attempting recovery...');
        recoverFromBrokenState();
        return; // Skip initialization if assets are inaccessible
      }
    }
    
    // Register service worker for PWA functionality
    registerServiceWorker();

    // Find the root element
    const rootElement = document.getElementById("root");

    // Check if root element exists before rendering
    if (rootElement) {
      createRoot(rootElement).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      
      // Mark app as initialized
      window.APP_INITIALIZED = true;
      
      // Add visibility change handler to detect when app comes back to foreground
      if (isRunningAsPWA()) {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            console.log('App returned to foreground');
            // You could trigger data refresh here if needed
          }
        });
      }
    } else {
      console.error("Root element not found. Cannot render application.");
    }
  } catch (error) {
    console.error("Failed to initialize app:", error);
    // If the app fails to initialize in PWA mode, try recovery
    if (isRunningAsPWA()) {
      console.log('Critical error during initialization, attempting recovery...');
      recoverFromBrokenState();
    }
  }
};

// Add missing type definition for window
declare global {
  interface Window {
    APP_INITIALIZED: boolean;
  }
}

// Initialize the app
initializeApp();
