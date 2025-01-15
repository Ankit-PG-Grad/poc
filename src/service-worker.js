/* eslint-disable no-restricted-globals */

/**
 * Service Worker Implementation
 * This file handles caching strategies and offline functionality for the PWA.
 * It uses the Workbox library to simplify service worker implementation.
 */

// Import required Workbox modules
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Take control of all pages immediately
clientsClaim();

/**
 * Precache Manifest
 * Automatically inject the precache manifest here.
 * This contains a list of URLs to cache during service worker installation.
 * The list is auto-generated based on the build output.
 */
precacheAndRoute(self.__WB_MANIFEST);

/**
 * App Shell Configuration
 * Set up routing for the application shell architecture.
 * This ensures that navigation requests are handled properly.
 */
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Define which requests should be handled by the app shell
  ({ request, url }) => {
    // Only handle navigation requests (e.g., page loads)
    if (request.mode !== 'navigate') {
      return false;
    }

    // Skip URLs starting with /_ (typically used for internal routes)
    if (url.pathname.startsWith('/_')) {
      return false;
    }

    // Skip URLs that look like files (have extensions)
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Handle all other navigation requests with the app shell
    return true;
  },
  // Use index.html as the app shell
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

/**
 * Google Fonts Caching Strategy
 * Cache the Google Fonts stylesheets and font files.
 * Uses stale-while-revalidate strategy to ensure fonts are always available
 * but also updated when new versions are available.
 */
registerRoute(
  // Match requests to Google Fonts CSS
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the actual font files
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        // Cache fonts for one year
        maxAgeSeconds: 60 * 60 * 24 * 365,
        // Limit the number of fonts we cache
        maxEntries: 30,
      }),
    ],
  })
);

/**
 * Static Assets Caching Strategy
 * Cache static resources like scripts, styles, and images.
 * Uses stale-while-revalidate strategy to provide fast access while keeping content fresh.
 */
registerRoute(
  // Match all static assets
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
); 