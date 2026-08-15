import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function requireAdmin(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // ignore invalid token, treat as anonymous
    }
  }
  next();
}

export async function requireShopOwner(req, res, next) {
  const shop = await prisma.shop.findUnique({ where: { slug: req.params.slug } });
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  if (shop.ownerId !== req.user.sub) return res.status(403).json({ error: 'You do not manage this shop' });
  req.shop = shop;
  next();
}

export function requireBusiness(req, res, next) {
  if (req.userAccountType !== 'business') return res.status(403).json({ error: 'Business account required' });
  next();
}

export function requirePremium(req, res, next) {
  if (!req.shop?.isPremium) return res.status(403).json({ error: 'This feature requires Café Premium' });
  next();
}
