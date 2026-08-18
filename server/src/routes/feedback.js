import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';

export const feedbackRouter = Router();

const CATEGORIES = ['idea', 'bug', 'general'];

feedbackRouter.post('/', optionalAuth, writeLimiter, async (req, res) => {
  const { category, rating, message, page } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (rating != null && (rating < 1 || rating > 5)) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: req.user?.sub ?? null,
      category: category || 'general',
      rating: rating ?? null,
      message: message.trim(),
      page: page || null,
    },
  });

  res.status(201).json({ feedback });
});

// Public: what's shipped as a result of feedback, for the "you said, we did" list.
feedbackRouter.get('/shipped', async (_req, res) => {
  const items = await prisma.feedback.findMany({
    where: { status: 'done', adminNote: { not: null } },
    orderBy: { reviewedAt: 'desc' },
    take: 20,
    select: { id: true, category: true, adminNote: true, reviewedAt: true },
  });
  res.json({ items });
});

feedbackRouter.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });
  res.json({ feedback });
});

feedbackRouter.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { status, adminNote } = req.body;
  const data = {};
  if (status !== undefined) {
    if (!['new', 'planned', 'done', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    data.status = status;
    data.reviewedAt = new Date();
  }
  if (adminNote !== undefined) data.adminNote = adminNote || null;

  const feedback = await prisma.feedback.update({
    where: { id: Number(req.params.id) },
    data,
  });
  res.json({ feedback });
});
