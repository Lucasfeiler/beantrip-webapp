import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const slugsToRemove = ['aroma-kaffeebar', 'balz-und-balz-hamburg'];

async function main() {
  for (const slug of slugsToRemove) {
    try {
      const shop = await prisma.shop.delete({ where: { slug } });
      console.log(`Removed ${shop.name} (${slug})`);
    } catch (e) {
      console.error(`Failed to remove ${slug}:`, e.message);
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
