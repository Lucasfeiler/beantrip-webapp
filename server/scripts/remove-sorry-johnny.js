import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shop = await prisma.shop.delete({ where: { slug: 'sorry-johnny-kaffeebar' } });
  console.log(`Removed ${shop.name} (${shop.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
