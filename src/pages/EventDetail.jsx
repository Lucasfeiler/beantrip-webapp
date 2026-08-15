import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setEvent(null);
    setNotFound(false);
    api.getEvent(slug)
      .then(({ event }) => setEvent(event))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-5 sm:px-8 py-24 text-center">
        <p className="font-display text-2xl mb-3">Event not found</p>
        <Link to="/events" className="text-[var(--color-accent)] font-semibold hover:underline">Back to Events</Link>
      </div>
    );
  }

  if (!event) {
    return <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center text-[var(--color-muted-fg)]">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
      <Link to="/events" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
        ← Back to Events
      </Link>

      {event.coverImage && (
        <img src={event.coverImage} alt={event.title} className="w-full h-56 sm:h-72 rounded-2xl object-cover mt-4" />
      )}

      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6">{event.title}</h1>
      <p className="text-sm text-[var(--color-muted-fg)] mt-1">
        {formatDate(event.eventDate)}{event.location ? ` · ${event.location}` : ''}
      </p>

      {event.excerpt && <p className="mt-5 text-base leading-relaxed text-[var(--color-muted-fg)]">{event.excerpt}</p>}

      {event.locked ? (
        <div className="mt-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4">
          <p className="text-sm font-semibold mb-1">☕ Beantrip Premium</p>
          <p className="text-sm text-[var(--color-muted-fg)]">
            Beantrip Premium members get the ticket link for this event.
          </p>
        </div>
      ) : event.ticketUrl ? (
        <a
          href={event.ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Get tickets ↗
        </a>
      ) : null}
    </div>
  );
}
