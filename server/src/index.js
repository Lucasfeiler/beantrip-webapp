import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { shopsRouter } from './routes/shops.js';
import { favoritesRouter } from './routes/favorites.js';
import { reviewsRouter } from './routes/reviews.js';
import { submissionsRouter } from './routes/submissions.js';
import { nearbyRouter } from './routes/nearby.js';
import { visitsRouter } from './routes/visits.js';
import { notificationsRouter } from './routes/notifications.js';
import { claimsRouter } from './routes/claims.js';
import { photosRouter } from './routes/photos.js';
import { articlesRouter } from './routes/articles.js';
import { usersRouter } from './routes/users.js';
import { flagsRouter } from './routes/flags.js';
import { eventsRouter } from './routes/events.js';
import { gearRouter } from './routes/gear.js';
import { feedSourcesRouter } from './routes/feedSources.js';
import { startScheduler } from './scheduler.js';

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/shops', shopsRouter);
app.use('/api/shops/:slug/reviews', reviewsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/nearby', nearbyRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/claims', claimsRouter);
app.use('/api', photosRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);
app.use('/api/flags', flagsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/gear', gearRouter);
app.use('/api/feed-sources', feedSourcesRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`beantrip API listening on http://localhost:${port}`);
  startScheduler();
});
