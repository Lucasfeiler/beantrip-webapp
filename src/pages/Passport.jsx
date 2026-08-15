import { Link } from 'react-router-dom';
import { useShops } from '../context/ShopsContext';
import ShopCard from '../components/ShopCard';
import { useVisits } from '../context/VisitsContext';
import { useAuth } from '../context/AuthContext';

const MILESTONES = [
  { count: 1, label: 'First Stamp' },
  { count: 5, label: 'Regular' },
  { count: 10, label: 'Explorer' },
  { count: 25, label: 'Collector' },
  { count: 50, label: 'Connoisseur' },
];

export default function Passport() {
  const { user } = useAuth();
  const { shops } = useShops();
  const { visits } = useVisits();
  const visitedShops = shops.filter((s) => visits.has(s.id));

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="font-display text-xl mb-2">Sign in to see your coffee passport</p>
        <p className="text-sm text-[var(--color-muted-fg)] mb-6">
          Your passport is tied to your account so it follows you across devices.
        </p>
        <Link to="/auth" className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Your Coffee Passport</h1>
      <p className="text-[var(--color-muted-fg)] mt-2">
        {visitedShops.length === 0
          ? 'Mark shops as "I\'ve been here" to start collecting stamps.'
          : `${visitedShops.length} stamp${visitedShops.length === 1 ? '' : 's'} collected.`}
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        {MILESTONES.map((m) => {
          const unlocked = visitedShops.length >= m.count;
          return (
            <span
              key={m.count}
              className={`text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border ${
                unlocked
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                  : 'text-[var(--color-muted-fg)] border-[var(--color-border)]'
              }`}
            >
              {unlocked ? '☕' : '🔒'} {m.label} ({m.count})
            </span>
          );
        })}
      </div>

      {visitedShops.length === 0 ? (
        <div className="text-center py-16">
          <Link to="/explore" className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm">
            Explore shops
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {visitedShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
