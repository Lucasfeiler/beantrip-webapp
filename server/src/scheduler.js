import cron from 'node-cron';
import { fetchNewArticles } from './rss.js';

export function startScheduler() {
  cron.schedule('0 6 * * *', () => {
    fetchNewArticles().catch((e) => console.error('Scheduled RSS fetch failed', e));
  });
}
