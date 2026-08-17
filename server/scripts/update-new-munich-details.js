import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'new-munich-details.json'), 'utf-8'));

  let updated = 0;
  for (const [slug, data] of Object.entries(map)) {
    try {
      await prisma.shop.update({
        where: { slug },
        data: {
          image: data.image,
          images: data.images,
          hours: data.hours,
          website: data.website,
          placeholder: false,
        },
      });
      updated++;
      console.log(`Updated ${slug}`);
    } catch (e) {
      console.error(`Failed to update ${slug}:`, e.message);
    }
  }

  console.log(`Done. Updated ${updated} shops.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
