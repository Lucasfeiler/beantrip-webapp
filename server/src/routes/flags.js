import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { recomputeShopRating } from './reviews.js';

export const flagsRouter = Router();

flagsRouter.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const flags = await prisma.reviewFlag.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      review: {
        select: {
          id: true,
          text: true,
          rating: true,
          user: { select: { name: true } },
          shop: { select: { slug: true, name: true, city: true } },
        },
      },
    },
  });
  res.json({ flags });
});

flagsRouter.patch('/:id/dismiss', requireAuth, requireAdmin, async (req, res) => {
  const flag = await prisma.reviewFlag.update({
    where: { id: Number(req.params.id) },
    data: { status: 'dismissed', reviewedAt: new Date() },
  });
  res.json({ flag });
});

flagsRouter.patch('/:id/remove', requireAuth, requireAdmin, async (req, res) => {
  const flag = await prisma.reviewFlag.findUnique({ where: { id: Number(req.params.id) } });
  if (!flag) return res.status(404).json({ error: 'Flag not found' });

  const review = await prisma.review.findUnique({ where: { id: flag.reviewId } });
  if (review) {
    await prisma.review.delete({ where: { id: review.id } });
    await recomputeShopRating(review.shopId);
  }

  const updated = await prisma.reviewFlag.update({
    where: { id: flag.id },
    data: { status: 'removed', reviewedAt: new Date() },
  });
  res.json({ flag: updated });
});
