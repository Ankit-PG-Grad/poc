/**
 * Service Worker Registration
 * This file handles the registration and lifecycle management of the service worker.
 * It provides functions to register and unregister the service worker, and handles
 * various scenarios like updates and offline mode.
 */

/**
 * Localhost Detection
 * Determines if the app is running on localhost.
 * This is important because service workers behave differently in development vs production.
 */
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * Register Service Worker
 * Main function to register the service worker.
 * Only registers in production environment and if service workers are supported.
 * 
 * @param {Object} config - Configuration object for callbacks
 * @param {Function} config.onSuccess - Callback when SW is registered successfully
 * @param {Function} config.onUpdate - Callback when SW finds an update
 */
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // Ensure service worker URL is in same origin as current page
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Service worker won't work if PUBLIC_URL is on different origin
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Special handling for localhost (development)
        checkValidServiceWorker(swUrl, config);

        // Additional logging for developers
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Standard registration for production
        registerValidSW(swUrl, config);
      }
    });
  }
}

/**
 * Register Valid Service Worker
 * Handles the actual registration of the service worker and its lifecycle events.
 * 
 * @param {string} swUrl - URL of the service worker file
 * @param {Object} config - Configuration object for callbacks
 */
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Handle service worker updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute update callback if provided
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Content is cached for offline use
              console.log('Content is cached for offline use.');

              // Execute success callback if provided
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

/**
 * Validate Service Worker
 * Verifies that the service worker exists and is a valid JavaScript file.
 * If validation fails, unregisters the service worker and reloads the page.
 * 
 * @param {string} swUrl - URL of the service worker file
 * @param {Object} config - Configuration object for callbacks
 */
function checkValidServiceWorker(swUrl, config) {
  // Attempt to fetch the service worker file
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      
      // Detect invalid service worker
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Invalid SW found - unregister and reload
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Valid SW found - proceed with registration
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

/**
 * Unregister Service Worker
 * Removes the service worker registration.
 * Useful when you want to disable PWA functionality.
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
} 