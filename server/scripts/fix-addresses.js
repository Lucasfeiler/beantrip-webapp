import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corrections = [
  {
    slug: 'lost-weekend',
    address: 'Schellingstraße 3, 80799 Munich',
    neighborhood: 'Schwabing',
    lat: 48.1491106,
    lng: 11.5796715,
  },
  {
    slug: 'cafe-bla',
    address: 'Lilienstraße 34, 81669 Munich',
    neighborhood: 'Haidhausen',
    lat: 48.1292783,
    lng: 11.5863281,
  },
  {
    slug: 'bonanza-coffee-roasters-berlin',
    address: 'Adalbertstraße 70, 10999 Berlin',
    neighborhood: 'Kreuzberg',
    lat: 52.5041653,
    lng: 13.4203241,
  },
  {
    slug: 'concierge-coffee-berlin',
    address: 'Paul-Lincke-Ufer 39-40, 10999 Berlin',
    neighborhood: 'Kreuzberg',
    lat: 52.4960873,
    lng: 13.4222456,
  },
  {
    slug: 'kaffeekirsche-berlin',
    address: 'Tempelhofer Damm 160, 12099 Berlin',
    neighborhood: 'Tempelhof',
    lat: 52.4637207,
    lng: 13.3852617,
  },
  {
    slug: 'elbgold-hamburg',
    address: 'Lagerstraße 34c, 20357 Hamburg',
    neighborhood: 'Sternschanze',
    lat: 53.5632199,
    lng: 9.9670748,
  },
];

async function main() {
  for (const c of corrections) {
    const { slug, ...data } = c;
    try {
      const updated = await prisma.shop.update({ where: { slug }, data });
      console.log(`Fixed ${updated.name}: ${updated.address}`);
    } catch (e) {
      console.error(`Failed to fix ${slug}:`, e.message);
    }
  }
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
