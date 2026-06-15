/**
 * Stale deployment chunk error handler.
 *
 * When a new version is deployed to GitHub Pages, old content-hashed chunk
 * files are deleted. Users with the old app loaded in their browser will get
 * 404s on dynamic imports when navigating between pages.
 *
 * This handler listens for Vite's `vite:preloadError` event, which fires
 * whenever ANY dynamic import() fails in production builds — including
 * route navigation chunks, defineAsyncComponent loaders, Mermaid, and
 * search index imports.
 *
 * On stale chunk error:
 * 1. Calls event.preventDefault() to suppress the error
 * 2. Reloads the page so the browser fetches fresh assets
 * 3. Uses sessionStorage to prevent infinite reload loops
 *
 * Note: VitePress's Router does NOT have an onError method (it's a custom
 * router, not Vue Router). The built-in hashmap.json retry only covers
 * page-level navigation, not component-level imports. This handler fills
 * that gap.
 *
 * @see https://vite.dev/guide/build#load-error-handling
 * @see https://github.com/vitejs/vite/pull/12084
 */

const RETRY_KEY = 'btp-chunk-retry';
const MAX_RETRIES = 2;

function shouldRetry(): boolean {
  const count = parseInt(sessionStorage.getItem(RETRY_KEY) || '0', 10);
  if (count >= MAX_RETRIES) {
    sessionStorage.removeItem(RETRY_KEY);
    return false;
  }
  sessionStorage.setItem(RETRY_KEY, String(count + 1));
  return true;
}

export function setupChunkErrorHandler(): void {
  window.addEventListener('vite:preloadError', (event: Event) => {
    event.preventDefault(); // Prevent error from reaching defineAsyncComponent/onErrorCaptured

    if (!shouldRetry()) {
      console.error(
        '[btp:chunk-error] Failed to load chunk after multiple retries.',
        'Please refresh the page manually.',
        (event as CustomEvent<Error>).detail?.message,
      );
      return;
    }

    const attempt = sessionStorage.getItem(RETRY_KEY);
    console.warn(
      `[btp:chunk-error] Stale chunk detected, reloading (attempt ${attempt}/${MAX_RETRIES})`,
    );

    // Use reload() instead of location.href = path to preserve base URL
    // (VitePress route.path strips base prefix, which breaks GitHub Pages URLs)
    window.location.reload();
  });

  // Clear retry counter on successful page load
  window.addEventListener('load', () => {
    sessionStorage.removeItem(RETRY_KEY);
  });
}
