import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corrections = [
  {
    slug: 'blackbird-coffee',
    address: 'Färbergraben 10, 80331 Munich',
    neighborhood: 'Altstadt',
    lat: 48.1371522,
    lng: 11.5713167,
  },
  {
    slug: 'vits-der-kaffee',
    address: 'Rumfordstraße 49, 80469 Munich',
    neighborhood: 'Gärtnerplatzviertel',
    lat: 48.1338436,
    lng: 11.5818539,
  },
  {
    slug: 'standl-20',
    address: 'Elisabethplatz, 80796 Munich',
    neighborhood: 'Schwabing-West',
    lat: 48.1569692,
    lng: 11.5746006,
  },
  {
    slug: 'gartensalon',
    address: 'Türkenstraße 90, 80799 Munich',
    neighborhood: 'Maxvorstadt',
    lat: 48.151885,
    lng: 11.577183,
  },
  {
    slug: 'muenchner-kaffeeroesterei',
    address: 'Viktualienmarkt, 80331 Munich',
    neighborhood: 'Altstadt',
    lat: 48.1346746,
    lng: 11.5762478,
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
