let loadPromise = null;

export function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loadPromise) return loadPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'));

  const originalConsoleError = console.error;

  const promise = new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, arg) => {
      if (settled) return;
      settled = true;
      fn(arg);
    };

    // Google never throws a catchable error for key/referrer/billing problems --
    // it silently swaps its own "Sorry! Something went wrong" overlay into the
    // map div and calls this global if it's defined. It's the only reliable
    // signal for that failure mode, which is invisible on a phone with no devtools.
    window.gm_authFailure = () => {
      settle(reject, new Error(
        'Google Maps authentication failed. This usually means the API key is invalid, ' +
        'restricted to a different domain/app, or billing is not enabled for it.'
      ));
    };

    // Google also logs the specific error type (RefererNotAllowedMapError,
    // InvalidKeyMapError, ApiNotActivatedMapError, etc.) via console.error
    // instead of throwing -- capture it so the real reason is visible.
    console.error = (...args) => {
      const text = args.map((a) => (typeof a === 'string' ? a : a?.message || String(a))).join(' ');
      if (/MapError|Google Maps JavaScript API/i.test(text)) {
        settle(reject, new Error(text));
      }
      originalConsoleError.apply(console, args);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => {
      // Give Google a moment to call gm_authFailure / log its error, since
      // those fire asynchronously after the script itself finishes loading.
      setTimeout(() => settle(resolve, window.google?.maps), 300);
    };
    script.onerror = () => settle(reject, new Error('Failed to load the Google Maps script (network error)'));
    document.head.appendChild(script);

    setTimeout(() => {
      settle(reject, new Error('Google Maps timed out loading after 10 seconds'));
    }, 10000);
  });

  loadPromise = promise.finally(() => {
    console.error = originalConsoleError;
  });

  // Don't cache a failed load -- let the next attempt (e.g. a page refresh) try again.
  loadPromise.catch(() => {
    loadPromise = null;
  });

  return loadPromise;
}
