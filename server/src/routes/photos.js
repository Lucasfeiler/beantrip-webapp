import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { getStorageBucket } from '../firebase.js';

export const photosRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Photo must be a JPEG, PNG, or WebP image'));
    }
    cb(null, true);
  },
});

async function deletePhotoBlob(storageUrl) {
  try {
    const bucket = getStorageBucket();
    const filePath = storageUrl.split(`${bucket.name}/`)[1];
    if (filePath) await bucket.file(filePath).delete({ ignoreNotFound: true });
  } catch (e) {
    console.error('Failed to delete photo from storage', e);
  }
}

// Approved photos for a shop -- public, shown on the shop detail page.
photosRouter.get('/shops/:slug/photos', async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { slug: req.params.slug } });
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const photos = await prisma.photo.findMany({
    where: { shopId: shop.id, moderationStatus: 'approved' },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ photos });
});

photosRouter.post('/shops/:slug/photos', requireAuth, writeLimiter, (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

    const shop = await prisma.shop.findUnique({ where: { slug: req.params.slug } });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    try {
      const ext = req.file.mimetype.split('/')[1];
      const filename = `user-photos/${shop.id}-${randomUUID()}.${ext}`;
      const bucket = getStorageBucket();
      const blob = bucket.file(filename);

      await blob.save(req.file.buffer, { contentType: req.file.mimetype });
      await blob.makePublic();
      const storageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      const photo = await prisma.photo.create({
        data: { userId: req.user.sub, shopId: shop.id, storageUrl },
      });

      res.status(201).json({ photo });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  });
});

photosRouter.get('/photos', requireAuth, requireAdmin, async (req, res) => {
  const photos = await prisma.photo.findMany({
    include: {
      shop: { select: { slug: true, name: true, city: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ photos });
});

photosRouter.patch('/photos/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return res.status(404).json({ error: 'Photo not found' });
  if (photo.moderationStatus !== 'pending') {
    return res.status(400).json({ error: `Photo is already ${photo.moderationStatus}` });
  }

  await prisma.photo.update({ where: { id }, data: { moderationStatus: 'approved', reviewedAt: new Date() } });
  res.json({ ok: true });
});

photosRouter.patch('/photos/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return res.status(404).json({ error: 'Photo not found' });
  if (photo.moderationStatus !== 'pending') {
    return res.status(400).json({ error: `Photo is already ${photo.moderationStatus}` });
  }

  await deletePhotoBlob(photo.storageUrl);
  await prisma.photo.update({ where: { id }, data: { moderationStatus: 'rejected', reviewedAt: new Date() } });
  res.json({ ok: true });
});
