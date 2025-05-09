// Service Worker for Rynse PWA
const CACHE_NAME = 'rynse-cache-v2'; // Increment cache version to force refresh
const APP_VERSION = '1.0.2'; // Increment version 
const FALLBACK_HTML = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/3d6deccc-d4a2-4bfb-9acc-18c6e46f5b73.png'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', APP_VERSION);
  
  // Force activate this service worker immediately, replacing any older version
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch((error) => {
        console.error('Service Worker: Precaching failed:', error);
        // Continue installation even if precaching fails
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', APP_VERSION);
  
  // Clear all caches to ensure fresh content
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all caches except the current one
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Now ready to handle fetches');
      return self.clients.claim(); // Take control of clients immediately
    })
  );
});

// Helper function to determine if a request should be cached
function shouldCache(url) {
  // Don't cache API requests, authentication, or dynamic content
  if (url.includes('supabase.co') || 
      url.includes('/auth/') || 
      url.includes('/api/')) {
    return false;
  }
  
  // Cache static assets
  return url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// Enhanced fetch event with network-first approach for main resources
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests, like analytics
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For GET requests only
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Supabase API requests
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  // Network-first strategy for HTML and main JavaScript files
  if (event.request.mode === 'navigate' || 
      (event.request.url.includes('/assets/') && event.request.url.endsWith('.js')) ||
      (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the fresh response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache))
            .catch(err => console.error('Failed to update cache:', err));
          
          return response;
        })
        .catch(() => {
          // If network fetch fails, return cached response or home
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('Service Worker: Serving cached content');
                return cachedResponse;
              }
              
              // If no cached response for this exact URL, try the home page
              return caches.match('/');
            });
        })
    );
    return;
  }

  // For other assets use cache-first approach
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || !shouldCache(event.request.url)) {
              return response;
            }

            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.error('Failed to cache new response:', err));

            return response;
          })
          .catch(() => {
            // If both network and cache fail for images/assets, return a placeholder
            if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
              return caches.match('/placeholder.svg');
            }
            // For JS/CSS files that fail, let the error bubble up
            throw new Error(`Failed to fetch: ${event.request.url}`);
          });
      })
  );
});

// Message handling for cache invalidation and health checks
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('Service Worker: Cache cleared by client');
        clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({type: 'CACHE_CLEARED'}));
        });
      })
    );
  }
});

// Handle errors and recovery
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.message);
});
