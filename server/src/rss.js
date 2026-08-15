import Parser from 'rss-parser';
import { prisma } from './db.js';
import { slugify } from './routes/articles.js';

const parser = new Parser();

export async function fetchNewArticles() {
  const allSources = await prisma.feedSource.findMany();
  console.log('[rss] all feed sources in DB:', JSON.stringify(allSources));
  const sources = await prisma.feedSource.findMany({ where: { active: true } });
  console.log('[rss] active-filtered sources:', JSON.stringify(sources));

  let created = 0;
  let skipped = 0;

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items ?? []) {
        if (!item.link || !item.title) continue;

        const existing = await prisma.article.findFirst({ where: { externalUrl: item.link } });
        if (existing) {
          skipped++;
          continue;
        }

        const excerpt = (item.contentSnippet ?? item.summary ?? '').slice(0, 300) || null;

        try {
          await prisma.article.create({
            data: {
              slug: slugify(item.title),
              title: item.title.trim(),
              coverImage: item.enclosure?.url ?? null,
              excerpt,
              externalUrl: item.link,
              published: false,
            },
          });
          created++;
        } catch (e) {
          if (e.code === 'P2002') {
            skipped++;
          } else {
            throw e;
          }
        }
      }

      await prisma.feedSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date(), lastError: null },
      });
    } catch (e) {
      await prisma.feedSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date(), lastError: e.message?.slice(0, 500) ?? 'Unknown error' },
      });
    }
  }

  return { sourcesChecked: sources.length, created, skipped };
}
