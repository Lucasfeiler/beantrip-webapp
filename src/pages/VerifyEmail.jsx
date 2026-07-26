import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(token ? 'verifying' : 'missing'); // missing | verifying | done | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.verifyEmail(token)
      .then(() => setStatus('done'))
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [token]);

  if (status === 'missing') {
    return (
      <div className="max-w-sm mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="font-display text-2xl mb-3">Invalid verification link</p>
        <Link to="/" className="text-[var(--color-accent)] font-semibold hover:underline">Back home</Link>
      </div>
    );
  }

  if (status === 'verifying') {
    return (
      <div className="max-w-sm mx-auto px-5 sm:px-8 py-20 text-center text-[var(--color-muted-fg)]">
        Verifying your email…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-sm mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="font-display text-2xl mb-3">Couldn't verify your email</p>
        <p className="text-sm text-[var(--color-muted-fg)] mb-6">{error}</p>
        <Link to="/profile" className="text-[var(--color-accent)] font-semibold hover:underline">Go to your profile</Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 sm:px-8 py-20 text-center">
      <p className="font-display text-2xl mb-3">Email verified</p>
      <p className="text-sm text-[var(--color-muted-fg)] mb-6">Your email address has been confirmed.</p>
      <Link to="/" className="text-[var(--color-accent)] font-semibold hover:underline">Back home</Link>
    </div>
  );
}
