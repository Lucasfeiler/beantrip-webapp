import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const SLUG = 'cafe-marais';
const NEW_ADDRESS = 'Parkstraße 2, 80339 München';
const NEW_NEIGHBORHOOD = 'Schwanthalerhöhe';
const NEW_DESCRIPTION = 'Parisian-style café with marble tables, rattan chairs, and an excellent espresso menu. Authentic French pastries and a great people-watching terrace.';

async function findLocation(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', query);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'geometry');
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.candidates?.length) return null;
  return data.candidates[0].geometry?.location ?? null;
}

async function main() {
  const shop = await prisma.shop.findUnique({ where: { slug: SLUG } });
  if (!shop) {
    console.error(`No shop found with slug "${SLUG}"`);
    process.exit(1);
  }

  const data = { address: NEW_ADDRESS, neighborhood: NEW_NEIGHBORHOOD, description: NEW_DESCRIPTION };

  if (API_KEY) {
    const location = await findLocation(`${shop.name}, ${NEW_ADDRESS}`);
    if (location) {
      data.lat = location.lat;
      data.lng = location.lng;
      console.log(`Re-geocoded to ${location.lat}, ${location.lng}`);
    } else {
      console.log('Could not re-geocode the new address -- leaving lat/lng unchanged');
    }
  } else {
    console.log('GOOGLE_PLACES_API_KEY not set -- leaving lat/lng unchanged');
  }

  const updated = await prisma.shop.update({ where: { slug: SLUG }, data });
  console.log('Updated:', updated.name, updated.address, updated.lat, updated.lng);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
