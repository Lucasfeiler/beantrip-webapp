import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useShops } from '../context/ShopsContext';
import { useLanguage } from '../context/LanguageContext';
import ShopCard from '../components/ShopCard';
import PageMeta from '../components/PageMeta';

export default function Explore() {
  const { shops, cities, allTags, loading } = useShops();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const [params] = useSearchParams();
  const legacyCityParam = params.get('city') || '';

  // The real, correctly-capitalized city name matching the slug in the URL
  // path (case-insensitive), e.g. "munich" -> "Munich".
  const cityParam = citySlug
    ? cities.find((c) => c.toLowerCase() === citySlug.toLowerCase()) || ''
    : legacyCityParam;

  // Old ?city=X links redirect to the canonical /explore/x path so there's
  // only ever one indexable URL per city.
  useEffect(() => {
    if (!citySlug && legacyCityParam) {
      navigate(`/explore/${legacyCityParam.toLowerCase()}`, { replace: true });
    }
  }, [citySlug, legacyCityParam, navigate]);

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [openNow, setOpenNow] = useState(false);

  const todayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      if (cityParam && s.city !== cityParam) return false;
      if (activeTag && !s.tags.includes(activeTag)) return false;
      if (query && !`${s.name} ${s.neighborhood} ${s.address}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (openNow && !(s.hours && s.hours[todayKey])) return false;
      return true;
    });
  }, [shops, cityParam, activeTag, query, openNow, todayKey]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center text-[var(--color-muted-fg)]">{t('explore.loading')}</div>;
  }

  const cityCount = cityParam ? shops.filter((s) => s.city === cityParam).length : 0;
  const pageTitle = cityParam
    ? `Specialty Coffee in ${cityParam} — Beantrip`
    : 'Explore the Coffee Scene — Beantrip';
  const pageDescription = cityParam
    ? `Discover ${cityCount} specialty coffee shops in ${cityParam}. Browse reviews, filter by roast type and brewing method, and find your next favorite spot.`
    : t('explore.subtitle');

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <PageMeta
        title={pageTitle}
        description={pageDescription}
        canonical={cityParam ? `/explore/${cityParam.toLowerCase()}` : '/explore'}
      />
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">
        {cityParam ? `Specialty Coffee in ${cityParam}` : t('explore.title')}
      </h1>
      <p className="text-[var(--color-muted-fg)] mt-2">{pageDescription}</p>

      <div className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          placeholder={t('explore.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-96 px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOpenNow((v) => !v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              openNow
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
            }`}
          >
            {t('explore.openNow')}
          </button>

          <select
            value={cityParam}
            onChange={(e) => {
              const v = e.target.value;
              navigate(v ? `/explore/${v.toLowerCase()}` : '/explore');
            }}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none"
          >
            <option value="">{t('explore.allCities')}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={activeTag}
            onChange={(e) => setActiveTag(e.target.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none"
          >
            <option value="">{t('explore.allFilters')}</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-6 text-sm text-[var(--color-muted-fg)]">{filtered.length} {t('explore.shopsFound')}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {filtered.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[var(--color-muted-fg)]">
          <p className="font-display text-xl mb-2">{t('explore.noMatchTitle')}</p>
          <p className="text-sm">{t('explore.noMatchSubtitle')}</p>
        </div>
      )}
    </div>
  );
}
