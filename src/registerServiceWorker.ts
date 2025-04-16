
// Function to check if app is being run in PWA mode
export function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

// Function to check if app has reliable storage access
async function checkStorageAvailability() {
  try {
    // Try to store and retrieve a test value
    localStorage.setItem('pwa_storage_test', 'test');
    const testValue = localStorage.getItem('pwa_storage_test');
    localStorage.removeItem('pwa_storage_test');
    
    return testValue === 'test';
  } catch (e) {
    console.error('Storage access check failed:', e);
    return false;
  }
}

// Function to notify a service worker to clear its cache
function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    });
  }
}

// Main registration function
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      // Check storage access before proceeding
      const storageAvailable = await checkStorageAvailability();
      
      if (!storageAvailable && isRunningAsPWA()) {
        console.warn('Storage access is limited, app may have stability issues');
      }
      
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          updateViaCache: 'none' // Never use cached service worker
        });
        
        console.log('ServiceWorker registration successful with scope:', registration.scope);
        
        // Check if there's an update and handle accordingly
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, notify user or update automatically
                console.log('New service worker available');
              }
            });
          }
        });
        
        // Add reload listener for PWA recovery
        if (isRunningAsPWA()) {
          window.addEventListener('online', async () => {
            // When coming back online, check for service worker updates
            try {
              await registration.update();
            } catch (err) {
              console.error('Failed to update service worker on reconnect:', err);
            }
          });
          
          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_CLEARED') {
              console.log('Cache cleared, refreshing app state');
              // You might want to reload data or refresh components here
            }
          });
        }
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
        
        // Try recovery by clearing app cache
        if (isRunningAsPWA()) {
          try {
            clearServiceWorkerCache();
            
            // If we're in a PWA and registration failed, reload the page
            // This helps recover from certain types of broken states
            console.log('Attempting recovery by reloading page');
            setTimeout(() => window.location.reload(), 1000);
          } catch (recoveryError) {
            console.error('Failed to recover from service worker error:', recoveryError);
          }
        }
      }
    });
  }
}

// Add a function to manually update the service worker
export function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
}

// Function to be called if the app detects it's stuck in a broken state
export function recoverFromBrokenState() {
  localStorage.removeItem('authSession');  // Clear any saved auth state
  sessionStorage.clear();  // Clear session storage
  clearServiceWorkerCache(); // Clear service worker cache
  
  // Force reload the page after a short delay
  setTimeout(() => {
    window.location.href = '/';  // Redirect to home page
    window.location.reload(true); // Force reload from server
  }, 500);
}

