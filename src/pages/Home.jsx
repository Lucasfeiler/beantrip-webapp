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
      <section className="relative overflow-hidden min-h-[440px] sm:min-h-[520px] flex items-center">
        <img
          src="/images/shops/gallery/man-vs-machine-muellerstrasse-2.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(100deg, rgba(76,43,8,0.94) 5%, rgba(76,43,8,0.8) 45%, rgba(76,43,8,0.45) 100%)' }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-16 w-full">
          <p
            className="uppercase tracking-[0.2em] text-xs font-semibold text-[var(--color-accent)] mb-4"
            style={{ animation: 'splash-fade-in 0.7s ease-out both' }}
          >
            {t('home.kicker')}
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] max-w-2xl text-white"
            style={{ animation: 'splash-fade-in 0.7s ease-out 0.12s both' }}
          >
            {t('home.title')}
          </h1>
          <p
            className="mt-5 text-base sm:text-lg text-white/80 max-w-xl"
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
              className="px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              {t('home.saveFavorites')}
            </Link>
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
