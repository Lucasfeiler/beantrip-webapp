import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

export const eventsRouter = Router();

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

eventsRouter.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({
    where: { published: true },
    select: { slug: true, title: true, coverImage: true, excerpt: true, location: true, eventDate: true, publishedAt: true },
    orderBy: { eventDate: 'asc' },
  });
  res.json({ events });
});

eventsRouter.get('/admin', requireAuth, requireAdmin, async (_req, res) => {
  const events = await prisma.event.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ events });
});

eventsRouter.get('/:slug', optionalAuth, async (req, res) => {
  const event = await prisma.event.findUnique({ where: { slug: req.params.slug } });
  if (!event || !event.published) return res.status(404).json({ error: 'Event not found' });

  let unlocked = false;
  if (req.user) {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    unlocked = !!(user?.isPremium || user?.isAdmin);
  }

  if (unlocked) return res.json({ event: { ...event, locked: false } });

  const { ticketUrl, ...teaser } = event;
  res.json({ event: { ...teaser, locked: true } });
});

eventsRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, coverImage, excerpt, location, eventDate, ticketUrl, published } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  try {
    const event = await prisma.event.create({
      data: {
        slug: slugify(title),
        title: title.trim(),
        coverImage: coverImage?.trim() || null,
        excerpt: excerpt?.trim() || null,
        location: location?.trim() || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        ticketUrl: ticketUrl?.trim() || null,
        published: !!published,
        publishedAt: published ? new Date() : null,
      },
    });
    res.status(201).json({ event });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'An event with a similar title already exists — adjust the title' });
    }
    throw e;
  }
});

eventsRouter.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { title, coverImage, excerpt, location, eventDate, ticketUrl, published } = req.body;
  const existing = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
  if (!existing) return res.status(404).json({ error: 'Event not found' });

  const nowPublishing = published === true && !existing.published && !existing.publishedAt;

  const event = await prisma.event.update({
    where: { id: existing.id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(coverImage !== undefined ? { coverImage: coverImage?.trim() || null } : {}),
      ...(excerpt !== undefined ? { excerpt: excerpt?.trim() || null } : {}),
      ...(location !== undefined ? { location: location?.trim() || null } : {}),
      ...(eventDate !== undefined ? { eventDate: eventDate ? new Date(eventDate) : null } : {}),
      ...(ticketUrl !== undefined ? { ticketUrl: ticketUrl?.trim() || null } : {}),
      ...(published !== undefined ? { published } : {}),
      ...(nowPublishing ? { publishedAt: new Date() } : {}),
    },
  });
  res.json({ event });
});

eventsRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.event.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
