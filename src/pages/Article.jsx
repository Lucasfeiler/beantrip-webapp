import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setArticle(null);
    setNotFound(false);
    api.getArticle(slug)
      .then(({ article }) => setArticle(article))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-5 sm:px-8 py-24 text-center">
        <p className="font-display text-2xl mb-3">Article not found</p>
        <Link to="/news" className="text-[var(--color-accent)] font-semibold hover:underline">Back to News</Link>
      </div>
    );
  }

  if (!article) {
    return <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center text-[var(--color-muted-fg)]">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
      <Link to="/news" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
        ← Back to News
      </Link>

      {article.coverImage && (
        <img src={article.coverImage} alt={article.title} className="w-full h-56 sm:h-72 rounded-2xl object-cover mt-4" />
      )}

      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6">{article.title}</h1>
      <p className="text-sm text-[var(--color-muted-fg)] mt-1">{formatDate(article.publishedAt)}</p>

      {article.excerpt && <p className="mt-5 text-base leading-relaxed text-[var(--color-muted-fg)]">{article.excerpt}</p>}

      {article.locked ? (
        <div className="mt-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4">
          <p className="text-sm font-semibold mb-1">☕ Beantrip Premium</p>
          <p className="text-sm text-[var(--color-muted-fg)]">
            Beantrip Premium members get full access to this article.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {article.body.split('\n\n').map((para, i) => (
            <p key={i} className="mt-4 text-base leading-relaxed">{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}
