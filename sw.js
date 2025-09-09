
// The name for the cache - IMPORTANT: Change this version number when you update the app's files.
const CACHE_NAME = 'gestion-visiteurs-tj-v14';

// List of files to cache for full offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/public_talks.ts',
  '/utils/image.ts',
  '/components/UpcomingVisits.tsx',
  '/components/SpeakerList.tsx',
  '/components/ScheduleVisitModal.tsx',
  '/components/CalendarView.tsx',
  '/components/MessagingCenter.tsx',
  '/components/SpeakerDetailsModal.tsx',
  '/components/Settings.tsx',
  '/components/MessageGeneratorModal.tsx',
  '/components/HostDetailsModal.tsx',
  '/components/GlobalSearchModal.tsx',
  '/components/ArchivedVisits.tsx',
  '/components/Dashboard.tsx',
  '/components/Icons.tsx',
  '/components/Avatar.tsx',
  '/components/LanguageSelector.tsx',
  '/components/HostList.tsx',
  '/contexts/ToastContext.tsx',
  '/contexts/ConfirmContext.tsx',
  '/contexts/DataContext.tsx',
  '/hooks/useLocalStorage.ts',
  // External dependencies
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/client',
  'https://aistudiocdn.com/react-dom@^19.1.1/'
];

// Install service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all core assets to the cache
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache during install:', error);
          // Log which URL failed
          urlsToCache.forEach(url => {
            fetch(url).catch(() => console.error(`Failed to fetch and cache: ${url}`));
          });
        });
      })
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

// Activate event to clean up old caches and take control
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// Fetch event to serve cached content
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache the new resource
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching failed:', error);
          // You could return a custom offline page here if you had one cached
          // For now, it will just fail as the browser would.
          throw error;
        });
      })
  );
});