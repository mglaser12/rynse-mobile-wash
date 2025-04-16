
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

// Attempt to recover session and critical app data
async function recoverAppState() {
  try {
    console.log('Attempting to recover app state...');
    // Any recovery logic here
    return true;
  } catch (e) {
    console.error('Failed to recover app state:', e);
    return false;
  }
}

// Check if profile cache is available and valid
function isProfileCacheValid() {
  try {
    const cachedProfile = localStorage.getItem('user_profile_cache');
    return cachedProfile !== null;
  } catch (e) {
    return false;
  }
}

// Main registration function with improved error handling
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      // Check storage access before proceeding
      const storageAvailable = await checkStorageAvailability();
      
      if (!storageAvailable && isRunningAsPWA()) {
        console.warn('Storage access is limited, app may have stability issues');
        // Try to recover by clearing caches
        clearServiceWorkerCache();
      }
      
      try {
        // Unregister any existing service worker first to force a clean reload
        // This helps with the 404 issues for assets with content hashes
        if (isRunningAsPWA()) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('Unregistered existing service worker');
          }
        }
        
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          updateViaCache: 'none', // Never use cached service worker
          scope: '/'
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
                // Force activation of the new service worker
                newWorker.postMessage({ type: 'SKIP_WAITING' });
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
              window.location.reload(); // Reload the page to get fresh assets
            }
          });
          
          // Auto-update service worker periodically
          setInterval(() => {
            registration.update().catch(err => {
              console.error('Periodic service worker update failed:', err);
            });
          }, 60 * 60 * 1000); // Check for updates every hour
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
            // Last resort: clear all caches and refresh
            if (window.caches) {
              window.caches.keys().then(keys => {
                keys.forEach(key => window.caches.delete(key));
              });
              setTimeout(() => window.location.reload(), 1500);
            }
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
    window.location.reload(); // Removed the parameter here that caused the TS error
  }, 500);
}

// Add a helper function to check if JS assets exist and are accessible
export async function checkAssetsAccessible() {
  try {
    // Try to fetch the main JS file
    const mainScript = document.querySelector('script[src*="/assets/"]');
    if (mainScript && mainScript.getAttribute('src')) {
      const response = await fetch(mainScript.getAttribute('src')!);
      if (!response.ok) {
        console.error('Main JS asset not accessible:', response.status);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error('Error checking assets:', e);
    return false;
  }
}

