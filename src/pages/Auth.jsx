import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export default function Auth() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [form, setForm] = useState({ name: '', email: '', password: '', accountType: 'customer' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.email, form.password, form.name, form.accountType);
      navigate(user.onboardingSeen ? '/' : '/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.forgotPassword(form.email);
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'forgot') {
    return (
      <div className="max-w-sm mx-auto px-5 sm:px-8 py-20">
        <h1 className="font-display text-3xl font-semibold mb-2 text-center">{t('auth.resetTitle')}</h1>
        <p className="text-sm text-[var(--color-muted-fg)] text-center mb-8">
          {t('auth.resetSubtitle')}
        </p>

        {resetSent ? (
          <p className="text-sm text-center text-[var(--color-accent)]">
            {t('auth.resetSent')}
          </p>
        ) : (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
            <input required type="email" placeholder={t('auth.email')} value={form.email} onChange={update('email')} className={inputClass} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm disabled:opacity-60"
            >
              {submitting ? t('auth.sending') : t('auth.sendResetLink')}
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-6 text-[var(--color-muted-fg)]">
          <button onClick={() => { setMode('login'); setResetSent(false); setError(''); }} className="text-[var(--color-accent)] font-semibold hover:underline">
            {t('auth.backToSignIn')}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 sm:px-8 py-20">
      <h1 className="font-display text-3xl font-semibold mb-2 text-center">
        {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
      </h1>
      <p className="text-sm text-[var(--color-muted-fg)] text-center mb-8">
        {t('auth.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, accountType: 'customer' }))}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  form.accountType === 'customer'
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
                }`}
              >
                {t('auth.customer')}
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, accountType: 'business' }))}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  form.accountType === 'business'
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
                }`}
              >
                {t('auth.cafeOwner')}
              </button>
            </div>
            {form.accountType === 'business' && (
              <p className="text-xs text-[var(--color-muted-fg)] -mt-2">
                {t('auth.businessHint')}
              </p>
            )}
            <input required placeholder={t('auth.name')} value={form.name} onChange={update('name')} className={inputClass} />
          </>
        )}
        <input required type="email" placeholder={t('auth.email')} value={form.email} onChange={update('email')} className={inputClass} />
        <div className="relative">
          <input
            required
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.password')}
            value={form.password}
            onChange={update('password')}
            className={`${inputClass} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            {showPassword ? t('auth.hide') : t('auth.show')}
          </button>
        </div>

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => { setMode('forgot'); setError(''); }}
            className="text-xs text-[var(--color-accent)] hover:underline self-end -mt-2"
          >
            {t('auth.forgotPassword')}
          </button>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm disabled:opacity-60"
        >
          {submitting ? t('auth.pleaseWait') : mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-[var(--color-muted-fg)]">
        {mode === 'login' ? (
          <>{t('auth.noAccount')} <button onClick={() => setMode('register')} className="text-[var(--color-accent)] font-semibold hover:underline">{t('auth.createOne')}</button></>
        ) : (
          <>{t('auth.haveAccount')} <button onClick={() => setMode('login')} className="text-[var(--color-accent)] font-semibold hover:underline">{t('auth.signIn')}</button></>
        )}
      </p>
    </div>
  );
}
