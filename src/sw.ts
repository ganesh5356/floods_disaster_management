import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { openDB } from 'idb';

declare let self: ServiceWorkerGlobalScope

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))


// --- IndexedDB Setup ---
const dbPromise = openDB('app-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('sos-requests')) {
        db.createObjectStore('sos-requests', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('field-reports')) {
        db.createObjectStore('field-reports', { keyPath: 'id' });
    }
  },
});

// --- Background Sync Event Listener ---
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-sos-requests') {
    event.waitUntil(syncSOSRequests());
  }
  if (event.tag === 'sync-field-reports') {
    event.waitUntil(syncFieldReports());
  }
});


// --- Sync Functions ---
async function syncSOSRequests() {
  const db = await dbPromise;
  const allReqs = await db.getAll('sos-requests');
  
  return Promise.all(allReqs.map(async (req) => {
    try {
      console.log('Syncing SOS request:', req);
      // In a real app, you would fetch() to your API endpoint
      // const response = await fetch('/api/sos', { method: 'POST', body: JSON.stringify(req) });
      // if (response.ok) {
        await db.delete('sos-requests', req.id);
        console.log('SOS request synced successfully:', req.id);
      // }
    } catch (error) {
      console.error('Error syncing SOS request:', error);
    }
  }));
}

async function syncFieldReports() {
    const db = await dbPromise;
    const allReports = await db.getAll('field-reports');

    return Promise.all(allReports.map(async (report) => {
        try {
            console.log('Syncing field report:', report);
            // In a real app, you would fetch() to your API endpoint
            // const response = await fetch('/api/reports', { method: 'POST', body: JSON.stringify(report) });
            // if (response.ok) {
                await db.delete('field-reports', report.id);
                console.log('Field report synced successfully:', report.id);
            // }
        } catch (error) {
            console.error('Error syncing field report:', error);
        }
    }));
}
