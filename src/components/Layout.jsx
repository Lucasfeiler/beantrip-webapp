import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationPrompt from './NotificationPrompt';
import FeedbackModal from './FeedbackModal';

const ONBOARDING_EXEMPT_PATHS = ['/onboarding', '/reset-password', '/verify-email'];

const primaryLinks = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/explore', key: 'nav.explore' },
  { to: '/near-me', key: 'nav.nearMe' },
  { to: '/map', key: 'nav.map' },
  { to: '/favorites', key: 'nav.favorites' },
  { to: '/add-shop', key: 'nav.add' },
];

const moreLinks = [
  { to: '/passport', key: 'nav.passport' },
  { to: '/news', key: 'nav.news' },
  { to: '/events', key: 'nav.events' },
  { to: '/gear', key: 'nav.gear' },
  { to: '/feedback', key: 'nav.feedback' },
];

function getPrimaryLinks(user) {
  const links = [...primaryLinks];
  if (user?.accountType === 'business') links.push({ to: '/my-shop', key: 'nav.myShop' });
  if (user?.isAdmin) links.push({ to: '/admin', key: 'nav.admin' });
  return links;
}

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center rounded-full border border-[var(--color-border)] text-xs font-semibold overflow-hidden shrink-0">
      {['en', 'de'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1.5 transition-colors ${
            lang === l ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]' : 'text-[var(--color-muted-fg)] hover:bg-[var(--color-card)]'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function MoreMenu({ pillClassName }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();
  const active = moreLinks.some((l) => l.to === location.pathname);

  useEffect(() => {
    function handleClick(e) {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 160;
      const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
      setMenuStyle({ position: 'fixed', top: rect.bottom + 4, left });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={toggleOpen}
        className={`${pillClassName} ${
          active ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]' : 'text-[var(--color-muted-fg)] hover:bg-[var(--color-card)]'
        }`}
      >
        {t('nav.more')}
      </button>
      {open && (
        <div ref={menuRef} style={menuStyle} className="w-40 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-50">
          {moreLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition-colors ${isActive ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-fg)] hover:bg-[var(--color-bg)]'}`
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const links = getPrimaryLinks(user);

  useEffect(() => {
    if (loading || !user || user.onboardingSeen) return;
    if (ONBOARDING_EXEMPT_PATHS.includes(location.pathname)) return;
    navigate('/onboarding');
  }, [loading, user, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="font-display text-xl font-semibold tracking-tight shrink-0">
            Bean<span className="text-[var(--color-accent)]">trip</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1 text-sm font-medium">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                      : 'text-[var(--color-muted-fg)] hover:bg-[var(--color-card)]'
                  }`
                }
              >
                {t(l.key)}
              </NavLink>
            ))}
            <MoreMenu pillClassName="px-3 py-2 rounded-full text-sm font-medium transition-colors" />
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-card)] transition-colors"
                >
                  {user.name}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-card)] transition-colors"
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:opacity-90 transition-opacity shrink-0"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>
        <nav className="sm:hidden flex items-center gap-1 px-5 pb-3 text-sm font-medium overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                    : 'text-[var(--color-muted-fg)] hover:bg-[var(--color-card)]'
                }`
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
          <MoreMenu pillClassName="px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors" />
          <LanguageToggle />
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <FeedbackModal />
      <NotificationPrompt />

      <footer className="border-t border-[var(--color-border)] mt-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-muted-fg)]">
          <p>© 2026 Beantrip</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[var(--color-accent)]">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-[var(--color-accent)]">{t('footer.terms')}</Link>
            <Link to="/impressum" className="hover:text-[var(--color-accent)]">{t('footer.impressum')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
