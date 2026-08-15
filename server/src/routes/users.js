import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const usersRouter = Router();

const SAFE_FIELDS = { id: true, name: true, email: true, isPremium: true, accountType: true };

usersRouter.get('/admin/search', requireAuth, requireAdmin, async (req, res) => {
  const query = (req.query.query || '').trim();
  if (!query) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: SAFE_FIELDS,
    take: 20,
    orderBy: { name: 'asc' },
  });
  res.json({ users });
});

usersRouter.patch('/:id/premium', requireAuth, requireAdmin, async (req, res) => {
  const { isPremium } = req.body;
  if (typeof isPremium !== 'boolean') return res.status(400).json({ error: 'isPremium must be a boolean' });

  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { isPremium },
    select: SAFE_FIELDS,
  });
  res.json({ user });
});
