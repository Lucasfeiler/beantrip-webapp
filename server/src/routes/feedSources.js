import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { fetchNewArticles } from '../rss.js';

export const feedSourcesRouter = Router();

feedSourcesRouter.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const sources = await prisma.feedSource.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ sources });
});

feedSourcesRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { url, name } = req.body;
  if (!url?.trim()) return res.status(400).json({ error: 'url is required' });

  try {
    const source = await prisma.feedSource.create({
      data: { url: url.trim(), name: name?.trim() || null },
    });
    res.status(201).json({ source });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'This feed URL has already been added' });
    }
    throw e;
  }
});

feedSourcesRouter.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { url, name, active } = req.body;
  const source = await prisma.feedSource.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(url !== undefined ? { url: url.trim() } : {}),
      ...(name !== undefined ? { name: name?.trim() || null } : {}),
      ...(active !== undefined ? { active } : {}),
    },
  });
  res.json({ source });
});

feedSourcesRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.feedSource.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

feedSourcesRouter.post('/fetch-now', requireAuth, requireAdmin, async (_req, res) => {
  const summary = await fetchNewArticles();
  res.json(summary);
});
