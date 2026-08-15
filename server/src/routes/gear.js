import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const gearRouter = Router();

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

gearRouter.get('/', async (_req, res) => {
  const items = await prisma.gearItem.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
  });
  res.json({ items });
});

gearRouter.get('/admin', requireAuth, requireAdmin, async (_req, res) => {
  const items = await prisma.gearItem.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ items });
});

gearRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, image, description, affiliateUrl, published } = req.body;
  if (!title?.trim() || !affiliateUrl?.trim()) {
    return res.status(400).json({ error: 'title and affiliateUrl are required' });
  }

  try {
    const item = await prisma.gearItem.create({
      data: {
        slug: slugify(title),
        title: title.trim(),
        image: image?.trim() || null,
        description: description?.trim() || null,
        affiliateUrl: affiliateUrl.trim(),
        published: !!published,
        publishedAt: published ? new Date() : null,
      },
    });
    res.status(201).json({ item });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'An item with a similar title already exists — adjust the title' });
    }
    throw e;
  }
});

gearRouter.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { title, image, description, affiliateUrl, published } = req.body;
  const existing = await prisma.gearItem.findUnique({ where: { id: Number(req.params.id) } });
  if (!existing) return res.status(404).json({ error: 'Item not found' });

  const nowPublishing = published === true && !existing.published && !existing.publishedAt;

  const item = await prisma.gearItem.update({
    where: { id: existing.id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(image !== undefined ? { image: image?.trim() || null } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(affiliateUrl !== undefined ? { affiliateUrl: affiliateUrl.trim() } : {}),
      ...(published !== undefined ? { published } : {}),
      ...(nowPublishing ? { publishedAt: new Date() } : {}),
    },
  });
  res.json({ item });
});

gearRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.gearItem.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
