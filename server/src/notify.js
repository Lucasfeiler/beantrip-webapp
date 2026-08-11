import { prisma } from './db.js';
import { getMessagingInstance } from './firebase.js';

async function sendToTokens(tokens, { title, body }) {
  if (tokens.length === 0) return { sent: 0 };

  const messaging = getMessagingInstance();
  const response = await messaging.sendEachForMulticast({
    tokens: tokens.map((t) => t.token),
    notification: { title, body },
  });

  const deadTokens = [];
  response.responses.forEach((r, i) => {
    if (!r.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(r.error?.code)) {
      deadTokens.push(tokens[i].token);
    }
  });
  if (deadTokens.length) {
    await prisma.deviceToken.deleteMany({ where: { token: { in: deadTokens } } });
  }

  return { sent: response.successCount };
}

export async function notifyUser(userId, { title, body }) {
  try {
    const tokens = await prisma.deviceToken.findMany({ where: { userId }, select: { token: true } });
    return await sendToTokens(tokens, { title, body });
  } catch (e) {
    console.error(`Failed to notify user ${userId}`, e);
    return { sent: 0 };
  }
}

export async function notifyUsersInCity(city, { title, body }) {
  try {
    const users = await prisma.user.findMany({
      where: { location: { equals: city, mode: 'insensitive' } },
      select: { id: true },
    });
    if (users.length === 0) return { sent: 0 };

    const tokens = await prisma.deviceToken.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
      select: { token: true },
    });
    return await sendToTokens(tokens, { title, body });
  } catch (e) {
    console.error(`Failed to notify users in ${city}`, e);
    return { sent: 0 };
  }
}
