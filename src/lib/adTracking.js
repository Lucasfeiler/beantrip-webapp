// Ad/analytics tracking loader. Nothing here fires until:
//   1. The user has accepted the cookie consent banner, AND
//   2. A real platform ID has been configured via env vars below.
// Add VITE_GOOGLE_ADS_ID / VITE_META_PIXEL_ID to .env.production once
// those accounts exist, then this starts working with no other changes.

const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

const CONSENT_KEY = 'beantrip:cookie-consent';

export function getConsent() {
  return localStorage.getItem(CONSENT_KEY);
}

export function setConsent(value) {
  localStorage.setItem(CONSENT_KEY, value);
  if (value === 'accepted') initAdTracking();
}

function loadGoogleAds() {
  if (!GOOGLE_ADS_ID || window.gtag) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GOOGLE_ADS_ID);
}

function loadMetaPixel() {
  if (!META_PIXEL_ID || window.fbq) return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

export function initAdTracking() {
  if (getConsent() !== 'accepted') return;
  loadGoogleAds();
  loadMetaPixel();
}
