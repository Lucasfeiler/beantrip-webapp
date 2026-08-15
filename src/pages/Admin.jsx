import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

function formatReviewedAt(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [submissions, setSubmissions] = useState(null);
  const [claims, setClaims] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [premiumShops, setPremiumShops] = useState(null);
  const [articles, setArticles] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [premiumUsers, setPremiumUsers] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [flags, setFlags] = useState(null);
  const [events, setEvents] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [remindingOwners, setRemindingOwners] = useState(false);
  const [remindResult, setRemindResult] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    api.listSubmissions()
      .then(({ submissions }) => setSubmissions(submissions))
      .catch((err) => setError(err.message));
    api.listClaims()
      .then(({ claims }) => setClaims(claims))
      .catch((err) => setError(err.message));
    api.listAllPhotos()
      .then(({ photos }) => setPhotos(photos))
      .catch((err) => setError(err.message));
    api.listPremiumShops()
      .then(({ shops }) => setPremiumShops(shops))
      .catch((err) => setError(err.message));
    api.listAdminArticles()
      .then(({ articles }) => setArticles(articles))
      .catch((err) => setError(err.message));
    api.listFlags()
      .then(({ flags }) => setFlags(flags))
      .catch((err) => setError(err.message));
    api.listAdminEvents()
      .then(({ events }) => setEvents(events))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    if (user?.isAdmin) load();
  }, [user]);

  if (loading) return null;

  if (!user?.isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-5 sm:px-8 py-24 text-center">
        <p className="font-display text-2xl mb-3">Not authorized</p>
        <p className="text-sm text-[var(--color-muted-fg)] mb-6">This page is admin-only.</p>
        <Link to="/" className="text-[var(--color-accent)] font-semibold hover:underline">Back home</Link>
      </div>
    );
  }

  const act = async (id, action) => {
    setBusyId(id);
    setError('');
    try {
      if (action === 'approve') await api.approveSubmission(id);
      else await api.rejectSubmission(id);
      const reviewedAt = new Date().toISOString();
      setSubmissions((subs) => subs.map((s) => (s.id === id ? { ...s, status: action === 'approve' ? 'approved' : 'rejected', reviewedAt } : s)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const actOnClaim = async (id, action) => {
    setBusyId(id);
    setError('');
    try {
      if (action === 'approve') await api.approveClaim(id);
      else await api.rejectClaim(id);
      const reviewedAt = new Date().toISOString();
      setClaims((cs) => cs.map((c) => (c.id === id ? { ...c, status: action === 'approve' ? 'approved' : 'rejected', reviewedAt } : c)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const actOnPhoto = async (id, action) => {
    setBusyId(id);
    setError('');
    try {
      if (action === 'approve') await api.approvePhoto(id);
      else await api.rejectPhoto(id);
      const reviewedAt = new Date().toISOString();
      setPhotos((ps) => ps.map((p) => (p.id === id ? { ...p, moderationStatus: action === 'approve' ? 'approved' : 'rejected', reviewedAt } : p)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const actOnPremium = async (slug, nextValue) => {
    setBusyId(slug);
    setError('');
    try {
      await api.toggleShopPremium(slug, nextValue);
      setPremiumShops((shops) => shops.map((s) => (s.slug === slug ? { ...s, isPremium: nextValue } : s)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const togglePublish = async (article) => {
    setBusyId(article.id);
    setError('');
    try {
      const { article: updated } = await api.updateArticle(article.id, { published: !article.published });
      setArticles((arts) => arts.map((a) => (a.id === article.id ? updated : a)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const deleteArticle = async (id) => {
    setBusyId(id);
    setError('');
    try {
      await api.deleteArticle(id);
      setArticles((arts) => arts.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemindOwners = async () => {
    if (!window.confirm('Send a reminder email to every café owner? This emails everyone with a claimed shop.')) return;
    setRemindingOwners(true);
    setRemindResult('');
    setError('');
    try {
      const { sent, failed, total } = await api.remindShopOwners();
      setRemindResult(`Sent to ${sent} of ${total} owners${failed ? ` (${failed} failed)` : ''}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemindingOwners(false);
    }
  };

  const togglePublishEvent = async (evt) => {
    setBusyId(evt.id);
    setError('');
    try {
      const { event: updated } = await api.updateEvent(evt.id, { published: !evt.published });
      setEvents((evts) => evts.map((e) => (e.id === evt.id ? updated : e)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const deleteEvent = async (id) => {
    setBusyId(id);
    setError('');
    try {
      await api.deleteEvent(id);
      setEvents((evts) => evts.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { users } = await api.searchUsers(userQuery);
      setPremiumUsers(users);
    } catch (err) {
      setError(err.message);
    }
  };

  const actOnUserPremium = async (id, nextValue) => {
    setBusyId(id);
    setError('');
    try {
      await api.toggleUserPremium(id, nextValue);
      setPremiumUsers((users) => users.map((u) => (u.id === id ? { ...u, isPremium: nextValue } : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const actOnFlag = async (id, action) => {
    setBusyId(id);
    setError('');
    try {
      if (action === 'dismiss') await api.dismissFlag(id);
      else await api.removeFlaggedReview(id);
      const reviewedAt = new Date().toISOString();
      setFlags((fs) => fs.map((f) => (f.id === id ? { ...f, status: action === 'dismiss' ? 'dismissed' : 'removed', reviewedAt } : f)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const pending = submissions?.filter((s) => s.status === 'pending') ?? [];
  const decided = submissions?.filter((s) => s.status !== 'pending') ?? [];
  const pendingClaims = claims?.filter((c) => c.status === 'pending') ?? [];
  const decidedClaims = claims?.filter((c) => c.status !== 'pending') ?? [];
  const pendingPhotos = photos?.filter((p) => p.moderationStatus === 'pending') ?? [];
  const decidedPhotos = photos?.filter((p) => p.moderationStatus !== 'pending') ?? [];
  const pendingFlags = flags?.filter((f) => f.status === 'pending') ?? [];
  const decidedFlags = flags?.filter((f) => f.status !== 'pending') ?? [];

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-semibold">Submitted Shops</h1>
      <p className="text-[var(--color-muted-fg)] mt-1">Approve to publish a shop, reject to dismiss it.</p>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {submissions === null ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">Loading…</p>
      ) : (
        <>
          <h2 className="font-display text-lg font-semibold mt-8 mb-3">Pending ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-fg)]">Nothing waiting on review.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {pending.map((s) => (
                <li key={s.id} className="border border-[var(--color-border)] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-[var(--color-muted-fg)]">{s.address}, {s.city}{s.neighborhood ? ` · ${s.neighborhood}` : ''}</p>
                      {s.description && <p className="text-sm mt-2">{s.description}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={busyId === s.id}
                        onClick={() => act(s.id, 'approve')}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === s.id}
                        onClick={() => act(s.id, 'reject')}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)] disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {decided.length > 0 && (
            <>
              <h2 className="font-display text-lg font-semibold mt-10 mb-3">Reviewed</h2>
              <ul className="flex flex-col gap-2">
                {decided.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)]">
                    <span>{s.name} <span className="text-[var(--color-muted-fg)]">· {s.city}</span></span>
                    <span className="text-right">
                      <span className={s.status === 'approved' ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-muted-fg)]'}>
                        {s.status}
                      </span>
                      {s.reviewedAt && <span className="block text-xs text-[var(--color-muted-fg)]">{formatReviewedAt(s.reviewedAt)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <h1 className="font-display text-3xl font-semibold mt-16">Shop Ownership Claims</h1>
      <p className="text-[var(--color-muted-fg)] mt-1">Approve to hand over editing rights to that business account.</p>

      {claims === null ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">Loading…</p>
      ) : (
        <>
          <h2 className="font-display text-lg font-semibold mt-8 mb-3">Pending ({pendingClaims.length})</h2>
          {pendingClaims.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-fg)]">Nothing waiting on review.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {pendingClaims.map((c) => (
                <li key={c.id} className="border border-[var(--color-border)] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{c.shop.name} <span className="text-[var(--color-muted-fg)] font-normal">· {c.shop.city}</span></p>
                      <p className="text-sm text-[var(--color-muted-fg)]">Claimed by {c.user.name} ({c.user.email})</p>
                      {c.message && <p className="text-sm mt-2">{c.message}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={busyId === c.id}
                        onClick={() => actOnClaim(c.id, 'approve')}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === c.id}
                        onClick={() => actOnClaim(c.id, 'reject')}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)] disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {decidedClaims.length > 0 && (
            <>
              <h2 className="font-display text-lg font-semibold mt-10 mb-3">Reviewed</h2>
              <ul className="flex flex-col gap-2">
                {decidedClaims.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)]">
                    <span>{c.shop.name} <span className="text-[var(--color-muted-fg)]">· {c.user.name}</span></span>
                    <span className="text-right">
                      <span className={c.status === 'approved' ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-muted-fg)]'}>
                        {c.status}
                      </span>
                      {c.reviewedAt && <span className="block text-xs text-[var(--color-muted-fg)]">{formatReviewedAt(c.reviewedAt)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <h1 className="font-display text-3xl font-semibold mt-16">Visitor Photos</h1>
      <p className="text-[var(--color-muted-fg)] mt-1">Approve to show the photo on the shop's page.</p>

      {photos === null ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">Loading…</p>
      ) : (
        <>
          <h2 className="font-display text-lg font-semibold mt-8 mb-3">Pending ({pendingPhotos.length})</h2>
          {pendingPhotos.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-fg)]">Nothing waiting on review.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {pendingPhotos.map((p) => (
                <li key={p.id} className="border border-[var(--color-border)] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img src={p.storageUrl} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                      <div>
                        <p className="font-semibold">{p.shop.name} <span className="text-[var(--color-muted-fg)] font-normal">· {p.shop.city}</span></p>
                        <p className="text-sm text-[var(--color-muted-fg)]">By {p.user.name} ({p.user.email})</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={busyId === p.id}
                        onClick={() => actOnPhoto(p.id, 'approve')}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === p.id}
                        onClick={() => actOnPhoto(p.id, 'reject')}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)] disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {decidedPhotos.length > 0 && (
            <>
              <h2 className="font-display text-lg font-semibold mt-10 mb-3">Reviewed</h2>
              <ul className="flex flex-col gap-2">
                {decidedPhotos.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)]">
                    <span>{p.shop.name} <span className="text-[var(--color-muted-fg)]">· {p.user.name}</span></span>
                    <span className="text-right">
                      <span className={p.moderationStatus === 'approved' ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-muted-fg)]'}>
                        {p.moderationStatus}
                      </span>
                      {p.reviewedAt && <span className="block text-xs text-[var(--color-muted-fg)]">{formatReviewedAt(p.reviewedAt)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <h1 className="font-display text-3xl font-semibold mt-16">Café Premium</h1>
      <p className="text-[var(--color-muted-fg)] mt-1">Toggle Café Premium on for a claimed shop to unlock analytics and stock status.</p>

      <div className="mt-6 flex items-center gap-3">
        <button
          disabled={remindingOwners}
          onClick={handleRemindOwners}
          className="px-4 py-2 rounded-xl border border-[var(--color-border)] font-semibold text-sm disabled:opacity-60"
        >
          {remindingOwners ? 'Sending…' : 'Send reminder to all café owners'}
        </button>
        {remindResult && <p className="text-sm text-[var(--color-muted-fg)]">{remindResult}</p>}
      </div>

      {premiumShops === null ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">Loading…</p>
      ) : premiumShops.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">No claimed shops yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 mt-8">
          {premiumShops.map((s) => (
            <li key={s.slug} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)]">
              <span>
                {s.name} <span className="text-[var(--color-muted-fg)]">· {s.city} · {s.owner?.name} ({s.owner?.email})</span>
              </span>
              <button
                disabled={busyId === s.slug}
                onClick={() => actOnPremium(s.slug, !s.isPremium)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border disabled:opacity-60 ${
                  s.isPremium
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {s.isPremium ? 'Premium' : 'Free'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <h1 className="font-display text-3xl font-semibold mt-16">Articles</h1>
      <p className="text-[var(--color-muted-fg)] mt-1">Curate links to coffee articles from around the web. The full link is visible to Beantrip Premium members only.</p>

      <div className="mt-8">
        <ArticleForm
          key={editingArticle?.id ?? 'new'}
          article={editingArticle}
          onSaved={(article) => {
            setArticles((arts) => {
              const exists = arts?.some((a) => a.id === article.id);
              return exists ? arts.map((a) => (a.id === article.id ? article : a)) : [article, ...(arts ?? [])];
            });
            setEditingArticle(null);
          }}
          onCancel={() => setEditingArticle(null)}
        />
      </div>

      {articles === null ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">Loading…</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">No articles yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 mt-8">
          {articles.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)] gap-3">
              <span>
                {a.title} <span className={a.published ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-muted-fg)]'}>· {a.published ? 'Published' : 'Draft'}</span>
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditingArticle(a)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)]"
                >
                  Edit
                </button>
                <button
                  disabled={busyId === a.id}
                  onClick={() => togglePublish(a)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)] disabled:opacity-60"
                >
                  {a.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  disabled={busyId === a.id}
                  onClick={() => deleteArticle(a.id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)] disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h1 className="font-display text-3xl font-semibold mt-16">Events</h1>
      <p className="text-[var(--color-muted-fg)] mt-1">Coffee festivals and events. The ticket link is visible to Beantrip Premium members only.</p>

      <div className="mt-8">
        <EventForm
          key={editingEvent?.id ?? 'new'}
          event={editingEvent}
          onSaved={(evt) => {
            setEvents((evts) => {
              const exists = evts?.some((e) => e.id === evt.id);
              return exists ? evts.map((e) => (e.id === evt.id ? evt : e)) : [evt, ...(evts ?? [])];
            });
            setEditingEvent(null);
          }}
          onCancel={() => setEditingEvent(null)}
        />
      </div>

      {events === null ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">No events yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 mt-8">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)] gap-3">
              <span>
                {e.title} <span className={e.published ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-muted-fg)]'}>· {e.published ? 'Published' : 'Draft'}</span>
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditingEvent(e)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)]"
                >
                  Edit
                </button>
                <button
                  disabled={busyId === e.id}
                  onClick={() => togglePublishEvent(e)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)] disabled:opacity-60"
                >
                  {e.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  disabled={busyId === e.id}
                  onClick={() => deleteEvent(e.id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)] disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h1 className="font-display text-3xl font-semibold mt-16">Premium Users</h1>
      <p className="text-[var(--color-muted-fg)] mt-1">Search for a user and toggle Beantrip Premium to unlock full articles for them.</p>

      <form onSubmit={handleSearchUsers} className="flex gap-2 mt-8">
        <input
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <button className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm">
          Search
        </button>
      </form>

      {premiumUsers !== null && (
        premiumUsers.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-fg)] mt-4">No users match.</p>
        ) : (
          <ul className="flex flex-col gap-2 mt-4">
            {premiumUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)]">
                <span>{u.name} <span className="text-[var(--color-muted-fg)]">· {u.email}</span></span>
                <button
                  disabled={busyId === u.id}
                  onClick={() => actOnUserPremium(u.id, !u.isPremium)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border disabled:opacity-60 ${
                    u.isPremium
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                      : 'border-[var(--color-border)]'
                  }`}
                >
                  {u.isPremium ? 'Premium' : 'Free'}
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      <h1 className="font-display text-3xl font-semibold mt-16">Flagged Reviews</h1>
      <p className="text-[var(--color-muted-fg)] mt-1">Dismiss to keep the review, remove to delete it.</p>

      {flags === null ? (
        <p className="text-sm text-[var(--color-muted-fg)] mt-8">Loading…</p>
      ) : (
        <>
          <h2 className="font-display text-lg font-semibold mt-8 mb-3">Pending ({pendingFlags.length})</h2>
          {pendingFlags.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-fg)]">Nothing waiting on review.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {pendingFlags.map((f) => (
                <li key={f.id} className="border border-[var(--color-border)] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {f.review ? (
                        <>
                          <p className="font-semibold">{f.review.shop.name} <span className="text-[var(--color-muted-fg)] font-normal">· {f.review.shop.city}</span></p>
                          <p className="text-sm text-[var(--color-muted-fg)]">By {f.review.user.name} · {'★'.repeat(f.review.rating)}</p>
                          <p className="text-sm mt-2">{f.review.text}</p>
                        </>
                      ) : (
                        <p className="text-sm text-[var(--color-muted-fg)] italic">Review already removed</p>
                      )}
                      <p className="text-sm text-[var(--color-muted-fg)] mt-2">Flagged by {f.user.name} ({f.user.email}){f.reason ? `: "${f.reason}"` : ''}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={busyId === f.id}
                        onClick={() => actOnFlag(f.id, 'dismiss')}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] disabled:opacity-60"
                      >
                        Dismiss
                      </button>
                      {f.review && (
                        <button
                          disabled={busyId === f.id}
                          onClick={() => actOnFlag(f.id, 'remove')}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--color-border)] disabled:opacity-60"
                        >
                          Remove review
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {decidedFlags.length > 0 && (
            <>
              <h2 className="font-display text-lg font-semibold mt-10 mb-3">Reviewed</h2>
              <ul className="flex flex-col gap-2">
                {decidedFlags.map((f) => (
                  <li key={f.id} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)]">
                    <span>{f.review ? f.review.shop.name : 'Review removed'} <span className="text-[var(--color-muted-fg)]">· flagged by {f.user.name}</span></span>
                    <span className="text-right">
                      <span className={f.status === 'removed' ? 'text-red-500 font-semibold' : 'text-[var(--color-muted-fg)]'}>
                        {f.status}
                      </span>
                      {f.reviewedAt && <span className="block text-xs text-[var(--color-muted-fg)]">{formatReviewedAt(f.reviewedAt)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

function ArticleForm({ article, onSaved, onCancel }) {
  const [title, setTitle] = useState(article?.title ?? '');
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [externalUrl, setExternalUrl] = useState(article?.externalUrl ?? '');
  const [published, setPublished] = useState(article?.published ?? false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { title, coverImage, excerpt, externalUrl, published };
      const { article: saved } = article
        ? await api.updateArticle(article.id, payload)
        : await api.createArticle(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-[var(--color-border)] rounded-xl p-4">
      <p className="text-sm font-semibold">{article ? 'Edit article' : 'New article'}</p>
      <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputClass} />
      <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover image URL" className={inputClass} />
      <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Your own short summary (write this yourself — shown free to everyone)" className={inputClass} />
      <input required type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="Link to the original article (https://…)" className={inputClass} />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPublished(false)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            !published ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
          }`}
        >
          Draft
        </button>
        <button
          type="button"
          onClick={() => setPublished(true)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            published ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
          }`}
        >
          Published
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={saving} className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm disabled:opacity-60">
          {saving ? 'Saving…' : article ? 'Save changes' : 'Create article'}
        </button>
        {article && (
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border border-[var(--color-border)] font-semibold text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function EventForm({ event, onSaved, onCancel }) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [coverImage, setCoverImage] = useState(event?.coverImage ?? '');
  const [excerpt, setExcerpt] = useState(event?.excerpt ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [eventDate, setEventDate] = useState(event?.eventDate ? event.eventDate.slice(0, 10) : '');
  const [ticketUrl, setTicketUrl] = useState(event?.ticketUrl ?? '');
  const [published, setPublished] = useState(event?.published ?? false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { title, coverImage, excerpt, location, eventDate: eventDate || null, ticketUrl, published };
      const { event: saved } = event
        ? await api.updateEvent(event.id, payload)
        : await api.createEvent(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-[var(--color-border)] rounded-xl p-4">
      <p className="text-sm font-semibold">{event ? 'Edit event' : 'New event'}</p>
      <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputClass} />
      <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover image URL" className={inputClass} />
      <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description" className={inputClass} />
      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className={inputClass} />
      <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClass} />
      <input type="url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="Ticket link (https://…)" className={inputClass} />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPublished(false)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            !published ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
          }`}
        >
          Draft
        </button>
        <button
          type="button"
          onClick={() => setPublished(true)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            published ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
          }`}
        >
          Published
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={saving} className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm disabled:opacity-60">
          {saving ? 'Saving…' : event ? 'Save changes' : 'Create event'}
        </button>
        {event && (
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border border-[var(--color-border)] font-semibold text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
