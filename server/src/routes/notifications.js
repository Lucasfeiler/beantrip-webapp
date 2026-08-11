import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { notifyUser } from '../notify.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.post('/register', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token is required' });

  await prisma.deviceToken.upsert({
    where: { token },
    update: { userId: req.user.sub },
    create: { token, userId: req.user.sub },
  });

  res.status(201).json({ ok: true });
});

notificationsRouter.post('/test', async (req, res) => {
  const hasToken = await prisma.deviceToken.findFirst({ where: { userId: req.user.sub } });
  if (!hasToken) return res.status(400).json({ error: 'No registered device for this account' });

  const { sent } = await notifyUser(req.user.sub, {
    title: 'Beantrip',
    body: "Notifications are working! You'll hear from us about new shops and updates.",
  });

  res.json({ sent });
});
