import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newShops = [
  {
    slug: 'kanso-coffee-lab',
    name: 'Kanso Coffee Lab',
    city: 'Munich',
    neighborhood: 'Altstadt',
    address: 'Theatinerstraße 35, Residenzpassage, 80333 Munich',
    description: 'Specialty coffee bar tucked inside the Residenzpassage courtyard near Marienplatz.',
    lat: 48.140403,
    lng: 11.576786,
  },
  {
    slug: 'stray-coffee-roasters',
    name: 'Stray Coffee Roasters',
    city: 'Munich',
    neighborhood: 'Schwanthalerhöhe',
    address: 'Gollierstraße 30, 80339 Munich',
    description: 'Specialty coffee roastery and café in Schwanthalerhöhe.',
    lat: 48.1358341,
    lng: 11.5416177,
  },
  {
    slug: 'cafe-faber',
    name: 'Café Faber',
    city: 'Munich',
    neighborhood: 'Au',
    address: 'Zeppelinstraße 5, 81541 Munich',
    description: 'Neighborhood specialty coffee café in Au.',
    lat: 48.125217,
    lng: 11.5805685,
  },
  {
    slug: 'coffee-twins',
    name: 'Coffee Twins',
    city: 'Munich',
    neighborhood: 'Isarvorstadt',
    address: 'Ehrengutstraße 18, 80469 Munich',
    description: 'Specialty coffee shop opened in 2022 by twin brothers Daniel and Jonas Fondaj.',
    lat: 48.1210567,
    lng: 11.5607344,
  },
  {
    slug: 'sweet-spot-kaffee-viktualienmarkt',
    name: 'Sweet Spot Kaffee (Viktualienmarkt)',
    city: 'Munich',
    neighborhood: 'Altstadt',
    address: 'Heiliggeiststraße 1, 80331 Munich',
    description: 'Specialty coffee bar just steps from Viktualienmarkt.',
    lat: 48.1358358,
    lng: 11.5777325,
  },
  {
    slug: 'sweet-spot-kaffee-reichenbachstrasse',
    name: 'Sweet Spot Kaffee (Reichenbachstraße)',
    city: 'Munich',
    neighborhood: 'Glockenbachviertel',
    address: 'Reichenbachstraße 38, 80469 Munich',
    description: 'Sister location of Sweet Spot Kaffee, a short walk from the Viktualienmarkt shop.',
    lat: 48.129006,
    lng: 11.5755096,
  },
  {
    slug: 'southbank-specialty-coffee',
    name: 'Southbank Specialty Coffee',
    city: 'Munich',
    neighborhood: 'Westend',
    address: 'Guldeinstraße 30, 80339 Munich',
    description: 'Specialty coffee café in Westend with an Australian-inspired interior; open Sundays.',
    lat: 48.1389356,
    lng: 11.5328364,
  },
  {
    slug: 'calima-specialty-coffee',
    name: 'Calima Specialty Coffee',
    city: 'Munich',
    neighborhood: 'Sendling-Westpark',
    address: 'Nestroystraße 2, 81373 Munich',
    description: 'Cozy specialty coffee spot known for Raf-style coffee with vanilla, lavender, or orange.',
    lat: 48.1217122,
    lng: 11.534813,
  },
  {
    slug: 'humpback-whale-specialty-coffee',
    name: 'Humpback Whale Specialty Coffee',
    city: 'Munich',
    neighborhood: 'Maxvorstadt',
    address: 'Türkenstraße 84a, Amalien Passage, 80799 Munich',
    description: 'Specialty coffee café in the historic Amalien Passage, founded by 2025 German Cup Tasters champion Lucy Huong Quach.',
    lat: 48.1517409,
    lng: 11.5773559,
  },
  {
    slug: 'suuapinga',
    name: 'Suuapinga',
    city: 'Munich',
    neighborhood: 'Glockenbach',
    address: 'Müllerstraße 46, 80469 Munich',
    description: 'Specialty coffee café and part of a small Munich roastery group, known for cinnamon buns.',
    lat: 48.1313517,
    lng: 11.5687831,
  },
  {
    slug: 'the-barn-tal',
    name: 'The Barn (Tal)',
    city: 'Munich',
    neighborhood: 'Altstadt',
    address: 'Tal 15, 80331 Munich',
    description: "Munich outpost of Berlin's The Barn Coffee Roasters, in the historic old town.",
    lat: 48.1364805,
    lng: 11.5798108,
  },
  {
    slug: 'the-barn-glockenbachviertel',
    name: 'The Barn (Glockenbachviertel)',
    city: 'Munich',
    neighborhood: 'Glockenbachviertel',
    address: 'Müllerstraße 38, 80469 Munich',
    description: 'Second Munich location of The Barn Coffee Roasters, with a dedicated brew bar.',
    lat: 48.131048,
    lng: 11.569861,
  },
];

async function main() {
  for (const shop of newShops) {
    try {
      const created = await prisma.shop.create({
        data: { ...shop, placeholder: true },
      });
      console.log(`Added ${created.name} (${created.slug})`);
    } catch (e) {
      console.error(`Failed to add ${shop.slug}:`, e.message);
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
