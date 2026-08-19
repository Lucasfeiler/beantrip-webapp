import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.shop.update({
    where: { slug: 'kanso-coffee-lab' },
    data: {
      images: [
        '/images/shops/gallery/kanso-coffee-lab-1.jpg',
        '/images/shops/gallery/kanso-coffee-lab-2.jpg',
        '/images/shops/gallery/kanso-coffee-lab-3.jpg',
        '/images/shops/gallery/kanso-coffee-lab-4.jpg',
        '/images/shops/gallery/kanso-coffee-lab-5.jpg',
      ],
    },
  });
  console.log(`Restored ${updated.images.length} photos on ${updated.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
