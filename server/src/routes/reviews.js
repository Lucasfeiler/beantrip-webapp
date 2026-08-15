import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireShopOwner, requirePremium } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';

export const reviewsRouter = Router({ mergeParams: true });

export async function recomputeShopRating(shopId) {
  const agg = await prisma.review.aggregate({
    where: { shopId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.shop.update({
    where: { id: shopId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}

reviewsRouter.get('/', async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { slug: req.params.slug } });
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const reviews = await prisma.review.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  });

  res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
      authorName: r.user.name,
      ownerReply: r.ownerReply,
      ownerReplyAt: r.ownerReplyAt,
    })),
  });
});

reviewsRouter.post('/', requireAuth, writeLimiter, async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { slug: req.params.slug } });
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const { rating, text } = req.body;
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'rating must be an integer from 1 to 5' });
  }
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Review text is required' });
  }

  try {
    await prisma.review.create({
      data: { userId: req.user.sub, shopId: shop.id, rating: ratingNum, text: text.trim() },
    });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'You already reviewed this shop' });
    }
    throw e;
  }

  await recomputeShopRating(shop.id);
  res.status(201).json({ ok: true });
});

reviewsRouter.patch('/:reviewId/reply', requireAuth, requireShopOwner, requirePremium, async (req, res) => {
  const { reply } = req.body;
  const review = await prisma.review.findUnique({ where: { id: Number(req.params.reviewId) } });
  if (!review || review.shopId !== req.shop.id) return res.status(404).json({ error: 'Review not found' });

  const trimmed = reply?.trim() || null;
  const updated = await prisma.review.update({
    where: { id: review.id },
    data: { ownerReply: trimmed, ownerReplyAt: trimmed ? new Date() : null },
  });

  res.json({
    review: {
      id: updated.id,
      ownerReply: updated.ownerReply,
      ownerReplyAt: updated.ownerReplyAt,
    },
  });
});

reviewsRouter.post('/:reviewId/flag', requireAuth, writeLimiter, async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { slug: req.params.slug } });
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const review = await prisma.review.findUnique({ where: { id: Number(req.params.reviewId) } });
  if (!review || review.shopId !== shop.id) return res.status(404).json({ error: 'Review not found' });

  const { reason } = req.body;
  try {
    await prisma.reviewFlag.create({
      data: { reviewId: review.id, userId: req.user.sub, reason: reason?.trim() || null },
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'You already flagged this review' });
    }
    throw e;
  }
});
