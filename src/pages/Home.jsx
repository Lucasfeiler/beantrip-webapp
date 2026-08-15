import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShops } from '../context/ShopsContext';
import { useAuth } from '../context/AuthContext';
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

export default function Home() {
  const { shops, cities, loading } = useShops();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [visitedShops, setVisitedShops] = useState([]);

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
    return <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center text-[var(--color-muted-fg)]">Loading shops…</div>;
  }

  return (
    <>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-14">
        <p className="uppercase tracking-[0.2em] text-xs font-semibold text-[var(--color-accent)] mb-4">
          Your Specialty Coffee Finder
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] max-w-2xl">
          Find Your Perfect Coffee
        </h1>
        <p className="mt-5 text-base sm:text-lg text-[var(--color-muted-fg)] max-w-xl">
          Beantrip takes you to the world's best specialty coffee shops. Filter by roast type,
          brewing method, and ambiance to find your next favorite spot.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/explore"
            className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Explore shops
          </Link>
          <Link
            to="/auth"
            className="px-6 py-3 rounded-xl border border-[var(--color-border)] font-semibold text-sm hover:bg-[var(--color-card)] transition-colors"
          >
            Save favorites
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="font-display text-2xl font-semibold mb-1">Browse by city</h2>
        <p className="text-sm text-[var(--color-muted-fg)] mb-6">
          Pick a city to explore its specialty coffee scene.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {cities.map((city) => (
            <Link
              key={city}
              to={`/explore?city=${encodeURIComponent(city)}`}
              className="group relative rounded-2xl overflow-hidden h-28 flex items-end p-4 border border-[var(--color-border)] hover:shadow-md transition-shadow"
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
                <p className="text-xs opacity-80">{cityCount(city)} spots</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-1">{personalized ? 'Picked for You' : 'Featured Shops'}</h2>
            <p className="text-sm text-[var(--color-muted-fg)]">{personalized ? 'Matched to your taste.' : 'Top-rated specialty coffee.'}</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0">
            View all
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
          <h2 className="font-display text-2xl font-semibold mb-1">More Like What You've Tried</h2>
          <p className="text-sm text-[var(--color-muted-fg)] mb-6">Based on shops you've visited.</p>
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
