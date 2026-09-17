import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';

const YEAR = 2026;

const PICKS = [
  {
    slug: 'man-vs-machine-muellerstrasse',
    name: 'Man vs. Machine',
    neighborhood: 'Glockenbach',
    rating: 4.5,
    reviews: 2742,
    blurb: "A working roastery as much as a café — industrial-chic, exposed brick, and a menu built around direct-trade beans. Come for precise espresso, stay for the seasonal single-origin pour-overs.",
  },
  {
    slug: 'muenchner-kaffeeroesterei',
    name: 'Münchner Kaffeerösterei',
    neighborhood: 'Altstadt',
    rating: 4.8,
    reviews: 957,
    blurb: "One of the oldest specialty roasters in the city, roasting since 1995 right at Viktualienmarkt. It's a tiny shop with a handful of seats, but the smell alone is worth the detour.",
  },
  {
    slug: 'kanso-coffee-lab',
    name: 'Kanso Coffee Lab',
    neighborhood: 'Altstadt',
    rating: 4.9,
    reviews: 1106,
    blurb: "Tucked into the Residenzpassage courtyard, just steps from Marienplatz — easy to miss, worth seeking out. One of the highest-rated coffee bars in the old town.",
  },
  {
    slug: 'coffee-twins',
    name: 'Coffee Twins',
    neighborhood: 'Isarvorstadt',
    rating: 4.9,
    reviews: 332,
    blurb: "Opened in 2022 by twin brothers Daniel and Jonas Fondaj, and already one of the best-reviewed shops in Isarvorstadt. A newer name worth knowing.",
  },
  {
    slug: 'milch-kekse',
    name: 'Milch & Kekse',
    neighborhood: 'Glockenbach',
    rating: 4.8,
    reviews: 610,
    blurb: "Homemade cookies, excellent flat whites, vintage furniture, and a sunny terrace. Local art on the walls, regulars in the seats — the kind of neighborhood spot Glockenbach is full of.",
  },
  {
    slug: 'cafe-bla',
    name: 'CAFÉ Blá',
    neighborhood: 'Haidhausen',
    rating: 4.6,
    reviews: 1564,
    blurb: "Nordic-inspired, all-day brunch menu, and coffee credentials that hold up on their own. Clean lines, blonde wood, and cinnamon buns that pair unreasonably well with a cortado.",
  },
  {
    slug: 'standl-20',
    name: 'Standl 20',
    neighborhood: 'Schwabing-West',
    rating: 4.6,
    reviews: 514,
    blurb: "A tiny market stand at Elisabethplatz with no seating at all — just precise, fast espresso for people on their way somewhere else. Proof that great coffee doesn't need a storefront.",
  },
  {
    slug: 'lost-weekend',
    name: 'Lost Weekend',
    neighborhood: 'Schwabing',
    rating: 4.3,
    reviews: 1838,
    blurb: "Equal parts coffee shop, independent bookstore, and record store. Cozy reading corners, serious coffee craft, and the occasional acoustic set or literary reading.",
  },
  {
    slug: 'cafe-marais',
    name: 'Café Marais',
    neighborhood: 'Schwanthalerhöhe',
    rating: 4.3,
    reviews: 1243,
    blurb: "Marble tables, rattan chairs, and an excellent espresso menu that wouldn't feel out of place in Paris — because that's exactly the point. Great terrace for people-watching.",
  },
  {
    slug: 'vits-der-kaffee',
    name: 'Vits der Kaffee',
    neighborhood: 'Gärtnerplatzviertel',
    rating: 4.4,
    reviews: 1022,
    blurb: "A compact espresso bar right by Marienplatz, built for speed without cutting quality — standing room only, but the shot is worth the elbow room.",
  },
  {
    slug: 'the-barn-tal',
    name: 'The Barn (Tal)',
    neighborhood: 'Altstadt',
    rating: 4.4,
    reviews: 204,
    blurb: "Berlin's well-known The Barn Coffee Roasters has a Munich outpost right in the historic old town — familiar quality if you know the Berlin original, worth trying if you don't.",
  },
  {
    slug: 'suuapinga',
    name: 'Suuapinga',
    neighborhood: 'Glockenbach',
    rating: 4.5,
    reviews: 512,
    blurb: "Part of a small local roastery group, and known as much for its cinnamon buns as its coffee. A dependable Glockenbach stop if Man vs. Machine has a line out the door.",
  },
];

export default function BestCoffeeMunich() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Coffee Shops in Munich (${YEAR})`,
    itemListElement: PICKS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://beantrip.com/shop/${p.slug}`,
      name: p.name,
    })),
  };
  const structuredDataJson = JSON.stringify(structuredData).replace(/</g, '\\u003c');

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <PageMeta
        title={`Best Coffee Shops in Munich (${YEAR}) | Beantrip`}
        description={`Our pick of ${PICKS.length} standout specialty coffee shops across Munich — from Glockenbach to Altstadt to Schwabing — with real ratings and what makes each one worth the visit.`}
        canonical="/guides/best-coffee-shops-munich"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson }} />

      <Link to="/explore/munich" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
        ← Back to all Munich shops
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-4">
        The Best Coffee Shops in Munich ({YEAR})
      </h1>
      <p className="text-[var(--color-muted-fg)] mt-3 leading-relaxed">
        Munich's specialty coffee scene is spread across the city — a working roastery in Glockenbach,
        a stall at Viktualienmarkt that's been going since 1995, a coffee-and-bookstore hybrid in
        Schwabing. We picked {PICKS.length} that stand out, drawing on real ratings and review counts
        rather than just alphabetical order. Ratings below are Google's, not ours — Beantrip's own
        review system is newer and still building up real user reviews.
      </p>

      <ol className="mt-8 flex flex-col gap-6">
        {PICKS.map((p, i) => (
          <li key={p.slug} className="border-b border-[var(--color-border)] pb-6 last:border-0">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-semibold">
                <span className="text-[var(--color-accent)] mr-2">{i + 1}.</span>
                <Link to={`/shop/${p.slug}`} className="hover:underline">{p.name}</Link>
              </h2>
              <span className="text-sm text-[var(--color-muted-fg)] shrink-0">
                ★ {p.rating.toFixed(1)} <span className="text-xs">({p.reviews.toLocaleString()} on Google)</span>
              </span>
            </div>
            <p className="text-xs text-[var(--color-accent)] font-medium mt-0.5">{p.neighborhood}</p>
            <p className="text-sm text-[var(--color-muted-fg)] mt-2 leading-relaxed">{p.blurb}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
        <p className="text-sm">
          This is a starting point, not the full picture — Munich has 90+ specialty coffee shops on
          Beantrip.{' '}
          <Link to="/explore/munich" className="text-[var(--color-accent)] font-semibold hover:underline">
            Browse all of them by neighborhood, roast, and brewing method →
          </Link>
        </p>
      </div>
    </div>
  );
}
