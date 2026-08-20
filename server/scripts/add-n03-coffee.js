import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shop = await prisma.shop.create({
    data: {
      slug: 'n03-coffee',
      name: 'N03 Coffee & Snack',
      city: 'Munich',
      neighborhood: 'Au',
      address: 'Zeppelinstraße 3, 81541 Munich',
      description: 'Neighborhood specialty coffee and snack spot in Au, next door to Café Faber.',
      lat: 48.1252415,
      lng: 11.5805119,
      image: '/images/shops/n03-coffee.jpg',
      images: [
        '/images/shops/gallery/n03-coffee-1.jpg',
        '/images/shops/gallery/n03-coffee-2.jpg',
        '/images/shops/gallery/n03-coffee-3.jpg',
        '/images/shops/gallery/n03-coffee-4.jpg',
        '/images/shops/gallery/n03-coffee-5.jpg',
      ],
      hours: {
        sun: '09:00-17:00',
        mon: '10:00-17:00',
        tue: '10:00-17:00',
        wed: '10:00-17:00',
        thu: '10:00-17:00',
        fri: '10:00-17:00',
        sat: '09:00-17:00',
      },
      website: 'https://www.instagram.com/n03.coffee/',
      placeholder: false,
    },
  });

  console.log(`Added ${shop.name} (${shop.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
