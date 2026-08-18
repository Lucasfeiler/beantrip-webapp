import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const CATEGORIES = [
  { value: 'idea', label: '💡 Idea' },
  { value: 'bug', label: '🐛 Something broken' },
  { value: 'general', label: '💬 General thoughts' },
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Feedback() {
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
        <p className="font-display text-2xl mb-3">Thank you!</p>
        <p className="text-sm text-[var(--color-muted-fg)]">
          Beantrip is still very much a work in progress, and notes like yours are exactly what shapes what we build next.
          We read every single one.
        </p>
        <Link to="/" className="inline-block mt-6 text-[var(--color-accent)] font-semibold hover:underline">Back to Beantrip</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Help shape Beantrip</h1>
      <p className="text-[var(--color-muted-fg)] mt-2">
        Beantrip is still a work in progress — tell us what's missing, what's broken, or what you'd love to see.
        This app is built based on what people like you tell us.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <span className="text-sm font-medium">What's this about?</span>
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
          <span className="text-sm font-medium">How's Beantrip working for you so far? <span className="text-[var(--color-muted-fg)] font-normal">(optional)</span></span>
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
          <span className="text-sm font-medium">Your feedback</span>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What would make Beantrip better for you?"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={submitting || !message.trim()}
          type="submit"
          className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send feedback'}
        </button>
      </form>

      {shipped?.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-semibold">You said, we did</h2>
          <p className="text-sm text-[var(--color-muted-fg)] mt-1">Changes made because of feedback like yours.</p>
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
