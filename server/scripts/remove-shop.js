import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node scripts/remove-shop.js <slug>');
    process.exit(1);
  }

  const shop = await prisma.shop.findUnique({ where: { slug } });
  if (!shop) {
    console.error(`No shop found with slug "${slug}"`);
    process.exit(1);
  }

  await prisma.shop.delete({ where: { slug } });
  console.log(`Removed "${shop.name}" (${shop.city}) and any of its favorites, reviews, visits, and claims.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
