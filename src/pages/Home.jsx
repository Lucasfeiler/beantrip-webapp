import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShops } from '../context/ShopsContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import ShopCard from '../components/ShopCard';

function personalizedScore(shop, user) {
  if (!user) return 0;
  let score = 0;
  if (user.favoriteRoast && shop.tags?.includes(user.favoriteRoast)) score += 1;
  if (user.favoriteBrewMethod && shop.tags?.includes(user.favoriteBrewMethod)) score += 1;
  return score;
}

function topTags(shopList, limit = 2) {
  const freq = {};
  shopList.forEach((s) => (s.tags ?? []).forEach((t) => { freq[t] = (freq[t] ?? 0) + 1; }));
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t]) => t);
}

const FEEDBACK_BANNER_KEY = 'beantrip:feedback-banner-dismissed';

export default function Home() {
  const { shops, cities, loading } = useShops();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [visitedShops, setVisitedShops] = useState([]);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(
    () => localStorage.getItem(FEEDBACK_BANNER_KEY) !== 'true'
  );

  const dismissFeedbackBanner = () => {
    localStorage.setItem(FEEDBACK_BANNER_KEY, 'true');
    setShowFeedbackBanner(false);
  };

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.accountType === 'business' && user.onboardingSeen) {
      navigate('/my-shop', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || user.accountType === 'business') {
      setVisitedShops([]);
      return;
    }
    api.listVisits().then(({ shops }) => setVisitedShops(shops)).catch(() => setVisitedShops([]));
  }, [user]);

  const cityCount = (city) => shops.filter((s) => s.city === city).length;

  const personalized = !!(user?.favoriteRoast || user?.favoriteBrewMethod);
  const featured = shops
    .filter((s) => !s.placeholder)
    .map((s) => ({ shop: s, score: personalizedScore(s, user) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.shop);

  const visitedIds = new Set(visitedShops.map((s) => s.id));
  const recommendedTags = topTags(visitedShops);
  const recommended = recommendedTags.length === 0 ? [] : shops
    .filter((s) => !s.placeholder && !visitedIds.has(s.id) && s.tags?.some((t) => recommendedTags.includes(t)))
    .slice(0, 6);

  if (loading || (user?.accountType === 'business' && user.onboardingSeen)) {
    return <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center text-[var(--color-muted-fg)]">{t('home.loading')}</div>;
  }

  return (
    <>
      {showFeedbackBanner && (
        <div className="bg-[var(--color-primary)] text-[var(--color-primary-fg)]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-2.5 flex items-center justify-between gap-4 text-sm">
            <p className="font-medium">
              {t('home.feedbackBannerPrefix')}{' '}
              <Link to="/feedback" className="underline underline-offset-2 hover:opacity-80">{t('home.feedbackBannerLink')}</Link>.
            </p>
            <button
              onClick={dismissFeedbackBanner}
              aria-label="Dismiss"
              className="shrink-0 opacity-70 hover:opacity-100 text-base leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-40 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'var(--color-accent)', animation: 'hero-blob 9s ease-in-out infinite alternate' }}
        />
        <div
          className="absolute top-1/4 -right-32 w-[26rem] h-[26rem] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'var(--color-primary)', animation: 'hero-blob 12s ease-in-out infinite alternate-reverse' }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            <div>
              <p
                className="uppercase tracking-[0.2em] text-xs font-semibold text-[var(--color-accent)] mb-4"
                style={{ animation: 'splash-fade-in 0.7s ease-out both' }}
              >
                {t('home.kicker')}
              </p>
              <h1
                className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold leading-[1.02] tracking-tight"
                style={{ animation: 'splash-fade-in 0.7s ease-out 0.12s both' }}
              >
                {t('home.title')}
              </h1>
              <p
                className="mt-5 text-base sm:text-lg text-[var(--color-muted-fg)] max-w-xl"
                style={{ animation: 'splash-fade-in 0.7s ease-out 0.24s both' }}
              >
                {t('home.subtitle')}
              </p>
              <div
                className="mt-8 flex flex-wrap gap-3"
                style={{ animation: 'splash-fade-in 0.7s ease-out 0.36s both' }}
              >
                <Link
                  to="/explore"
                  className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  {t('home.exploreShops')}
                </Link>
                <Link
                  to="/auth"
                  className="px-6 py-3 rounded-xl border border-[var(--color-border)] font-semibold text-sm hover:bg-[var(--color-card)] transition-colors"
                >
                  {t('home.saveFavorites')}
                </Link>
              </div>
              <div
                className="mt-10 flex items-center gap-8"
                style={{ animation: 'splash-fade-in 0.7s ease-out 0.46s both' }}
              >
                <div>
                  <p className="font-display text-2xl font-semibold">{shops.length}+</p>
                  <p className="text-xs text-[var(--color-muted-fg)] uppercase tracking-wide mt-0.5">{t('home.statShops')}</p>
                </div>
                <div className="w-px h-8 bg-[var(--color-border)]" />
                <div>
                  <p className="font-display text-2xl font-semibold">{cities.length}</p>
                  <p className="text-xs text-[var(--color-muted-fg)] uppercase tracking-wide mt-0.5">{t('home.statCities')}</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block h-80">
              <img
                src="/images/shops/gallery/kanso-coffee-lab-1.jpg"
                alt=""
                className="absolute top-0 left-6 w-52 h-40 object-cover rounded-2xl border border-[var(--color-border)] shadow-xl"
                style={{ '--r': '-6deg', transform: 'rotate(-6deg)', animation: 'hero-float 6s ease-in-out infinite' }}
              />
              <img
                src="/images/shops/gallery/man-vs-machine-muellerstrasse-2.jpg"
                alt=""
                className="absolute top-28 right-2 w-44 h-36 object-cover rounded-2xl border border-[var(--color-border)] shadow-xl"
                style={{ '--r': '5deg', transform: 'rotate(5deg)', animation: 'hero-float 7s ease-in-out infinite 0.4s' }}
              />
              <img
                src="/images/shops/gallery/the-barn-glockenbachviertel-1.jpg"
                alt=""
                className="absolute bottom-0 left-16 w-48 h-36 object-cover rounded-2xl border border-[var(--color-border)] shadow-xl"
                style={{ '--r': '3deg', transform: 'rotate(3deg)', animation: 'hero-float 8s ease-in-out infinite 0.8s' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="font-display text-2xl font-semibold mb-1">{t('home.browseByCity')}</h2>
        <p className="text-sm text-[var(--color-muted-fg)] mb-6">
          {t('home.browseByCitySubtitle')}
        </p>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {cities.map((city) => (
            <Link
              key={city}
              to={`/explore?city=${encodeURIComponent(city)}`}
              className="group relative shrink-0 snap-start w-40 sm:w-48 rounded-2xl overflow-hidden h-28 flex items-end p-4 border border-[var(--color-border)] hover:shadow-md transition-shadow"
            >
              <img
                src={`/images/cities/${city.toLowerCase()}.jpg`}
                alt={city}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)' }} />
              <div className="relative text-white">
                <p className="font-display font-semibold">{city}</p>
                <p className="text-xs opacity-80">{cityCount(city)} {t('home.spots')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-1">{personalized ? t('home.pickedForYou') : t('home.featuredShops')}</h2>
            <p className="text-sm text-[var(--color-muted-fg)]">{personalized ? t('home.pickedForYouSubtitle') : t('home.featuredSubtitle')}</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0">
            {t('home.viewAll')}
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
          <h2 className="font-display text-2xl font-semibold mb-1">{t('home.moreLikeTried')}</h2>
          <p className="text-sm text-[var(--color-muted-fg)] mb-6">{t('home.moreLikeTriedSubtitle')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommended.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
