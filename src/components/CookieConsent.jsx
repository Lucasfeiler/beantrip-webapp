import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent } from '../lib/adTracking';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  const choose = (value) => {
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-lg p-4">
      <p className="text-sm font-semibold">Cookies</p>
      <p className="text-sm text-[var(--color-muted-fg)] mt-1">
        Beantrip uses essential cookies to run the app. With your permission, we'd also like to use
        optional cookies to understand usage and show more relevant promotions. See our{' '}
        <Link to="/privacy" className="text-[var(--color-accent)] hover:underline">Privacy Policy</Link>.
      </p>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => choose('accepted')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
        <button
          onClick={() => choose('declined')}
          className="px-4 py-2 rounded-xl border border-[var(--color-border)] font-semibold text-sm hover:bg-[var(--color-bg)] transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
