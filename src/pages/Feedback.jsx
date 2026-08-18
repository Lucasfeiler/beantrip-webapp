import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Feedback() {
  const { t } = useLanguage();
  const CATEGORIES = [
    { value: 'idea', label: t('feedback.categoryIdea') },
    { value: 'bug', label: t('feedback.categoryBug') },
    { value: 'general', label: t('feedback.categoryGeneral') },
  ];
  const [category, setCategory] = useState('idea');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [shipped, setShipped] = useState(null);

  useEffect(() => {
    api.shippedFeedback().then(({ items }) => setShipped(items)).catch(() => setShipped([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await api.submitFeedback({ category, rating: rating || null, message });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-5 sm:px-8 py-24 text-center">
        <p className="text-4xl mb-4">☕🙏</p>
        <p className="font-display text-2xl mb-3">{t('feedback.thanksTitle')}</p>
        <p className="text-sm text-[var(--color-muted-fg)]">
          {t('feedback.thanksBody')}
        </p>
        <Link to="/" className="inline-block mt-6 text-[var(--color-accent)] font-semibold hover:underline">{t('feedback.backHome')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">{t('feedback.title')}</h1>
      <p className="text-[var(--color-muted-fg)] mt-2">
        {t('feedback.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <span className="text-sm font-medium">{t('feedback.whatAbout')}</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  category === c.value
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium">{t('feedback.ratingLabel')} <span className="text-[var(--color-muted-fg)] font-normal">{t('feedback.optional')}</span></span>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(rating === n ? 0 : n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${n} out of 5`}
                className="text-3xl leading-none transition-transform hover:scale-110"
              >
                {(hoverRating || rating) >= n ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('feedback.messageLabel')}</span>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('feedback.messagePlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={submitting || !message.trim()}
          type="submit"
          className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {submitting ? t('feedback.sending') : t('feedback.send')}
        </button>
      </form>

      {shipped?.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-semibold">{t('feedback.shippedTitle')}</h2>
          <p className="text-sm text-[var(--color-muted-fg)] mt-1">{t('feedback.shippedSubtitle')}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {shipped.map((item) => (
              <li key={item.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-3">
                <p className="text-sm">{item.adminNote}</p>
                {item.reviewedAt && <p className="text-xs text-[var(--color-muted-fg)] mt-1">{formatDate(item.reviewedAt)}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
