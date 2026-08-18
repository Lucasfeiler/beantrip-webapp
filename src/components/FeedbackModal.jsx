import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

const SUBMITTED_KEY = 'beantrip:feedback-modal-submitted';
const DISMISSED_AT_KEY = 'beantrip:feedback-modal-dismissed-at';
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const SHOW_DELAY_MS = 1500;

const SKIP_PATHS = ['/feedback', '/auth', '/onboarding', '/reset-password', '/verify-email'];

export default function FeedbackModal() {
  const { t } = useLanguage();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [category, setCategory] = useState('idea');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (SKIP_PATHS.includes(location.pathname)) return;
    if (localStorage.getItem(SUBMITTED_KEY)) return;
    const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) || 0);
    if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await api.submitFeedback({ category, rating: rating || null, message, page: location.pathname });
      localStorage.setItem(SUBMITTED_KEY, '1');
      setSubmitted(true);
      setTimeout(() => setVisible(false), 2200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const CATEGORIES = [
    { value: 'idea', label: t('feedback.categoryIdea') },
    { value: 'bug', label: t('feedback.categoryBug') },
    { value: 'general', label: t('feedback.categoryGeneral') },
  ];

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 relative"
      >
        <button
          onClick={dismiss}
          aria-label={t('feedback.close')}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-lg text-[var(--color-muted-fg)] hover:bg-[var(--color-card)] transition-colors"
        >
          ×
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-3">☕🙏</p>
            <p className="font-display text-xl font-semibold mb-2">{t('feedback.thanksTitle')}</p>
            <p className="text-sm text-[var(--color-muted-fg)]">{t('feedback.thanksBody')}</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)] mb-1">
              {t('feedback.modalKicker')}
            </p>
            <h2 className="font-display text-2xl font-semibold">{t('feedback.title')}</h2>
            <p className="text-sm text-[var(--color-muted-fg)] mt-1.5">{t('feedback.subtitle')}</p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                      category === c.value
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? 0 : n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${n} out of 5`}
                    className="text-2xl leading-none transition-transform hover:scale-110"
                  >
                    {(hoverRating || rating) >= n ? '★' : '☆'}
                  </button>
                ))}
              </div>

              <textarea
                required
                autoFocus
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('feedback.messagePlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center gap-3">
                <button
                  disabled={submitting || !message.trim()}
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? t('feedback.sending') : t('feedback.send')}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="text-sm font-semibold text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-colors"
                >
                  {t('feedback.maybeLater')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
