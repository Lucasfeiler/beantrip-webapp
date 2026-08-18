import { Link } from 'react-router-dom';
import { useShops } from '../context/ShopsContext';
import ShopCard from '../components/ShopCard';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Favorites() {
  const { user } = useAuth();
  const { shops } = useShops();
  const { favorites } = useFavorites();
  const { t } = useLanguage();
  const favShops = shops.filter((s) => favorites.has(s.id));

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="font-display text-xl mb-2">{t('favorites.signInTitle')}</p>
        <p className="text-sm text-[var(--color-muted-fg)] mb-6">
          {t('favorites.signInBody')}
        </p>
        <Link to="/auth" className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm">
          {t('auth.signIn')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">{t('favorites.title')}</h1>
      <p className="text-[var(--color-muted-fg)] mt-2">
        {t('favorites.subtitle')}
      </p>

      {favShops.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-xl mb-2">{t('favorites.emptyTitle')}</p>
          <p className="text-sm text-[var(--color-muted-fg)] mb-6">
            {t('favorites.emptyBody')}
          </p>
          <Link to="/explore" className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm">
            {t('home.exploreShops')}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {favShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
