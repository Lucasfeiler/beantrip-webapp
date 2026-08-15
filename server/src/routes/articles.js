import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

export const articlesRouter = Router();

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

articlesRouter.get('/', async (_req, res) => {
  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true, title: true, coverImage: true, excerpt: true, publishedAt: true },
    orderBy: { publishedAt: 'desc' },
  });
  res.json({ articles });
});

articlesRouter.get('/admin', requireAuth, requireAdmin, async (_req, res) => {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ articles });
});

articlesRouter.get('/:slug', optionalAuth, async (req, res) => {
  const article = await prisma.article.findUnique({ where: { slug: req.params.slug } });
  if (!article || !article.published) return res.status(404).json({ error: 'Article not found' });

  let unlocked = false;
  if (req.user) {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    unlocked = !!(user?.isPremium || user?.isAdmin);
  }

  if (unlocked) return res.json({ article: { ...article, locked: false } });

  const { externalUrl, ...teaser } = article;
  res.json({ article: { ...teaser, locked: true } });
});

articlesRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, coverImage, excerpt, externalUrl, published } = req.body;
  if (!title?.trim() || !externalUrl?.trim()) {
    return res.status(400).json({ error: 'title and externalUrl are required' });
  }

  try {
    const article = await prisma.article.create({
      data: {
        slug: slugify(title),
        title: title.trim(),
        coverImage: coverImage?.trim() || null,
        excerpt: excerpt?.trim() || null,
        externalUrl: externalUrl.trim(),
        published: !!published,
        publishedAt: published ? new Date() : null,
      },
    });
    res.status(201).json({ article });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'An article with a similar title already exists — adjust the title' });
    }
    throw e;
  }
});

articlesRouter.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { title, coverImage, excerpt, externalUrl, published } = req.body;
  const existing = await prisma.article.findUnique({ where: { id: Number(req.params.id) } });
  if (!existing) return res.status(404).json({ error: 'Article not found' });

  const nowPublishing = published === true && !existing.published && !existing.publishedAt;

  const article = await prisma.article.update({
    where: { id: existing.id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(coverImage !== undefined ? { coverImage: coverImage?.trim() || null } : {}),
      ...(excerpt !== undefined ? { excerpt: excerpt?.trim() || null } : {}),
      ...(externalUrl !== undefined ? { externalUrl: externalUrl.trim() } : {}),
      ...(published !== undefined ? { published } : {}),
      ...(nowPublishing ? { publishedAt: new Date() } : {}),
    },
  });
  res.json({ article });
});

articlesRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.article.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
