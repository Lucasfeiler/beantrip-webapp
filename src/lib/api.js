const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'coffeespots:token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function uploadFile(path, file) {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (email, password, name, accountType) =>
    request('/api/auth/register', { method: 'POST', body: { email, password, name, accountType } }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me', { auth: true }),
  updateProfile: (data) => request('/api/auth/me', { method: 'PATCH', auth: true, body: data }),
  deleteAccount: (password) => request('/api/auth/me', { method: 'DELETE', auth: true, body: { password } }),
  changeEmail: (email, password) => request('/api/auth/me/email', { method: 'PATCH', auth: true, body: { email, password } }),
  forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => request('/api/auth/reset-password', { method: 'POST', body: { token, password } }),
  verifyEmail: (token) => request('/api/auth/verify-email', { method: 'POST', body: { token } }),
  resendVerification: () => request('/api/auth/resend-verification', { method: 'POST', auth: true }),
  uploadPhoto: (file) => uploadFile('/api/auth/me/photo', file),
  removePhoto: () => request('/api/auth/me/photo', { method: 'DELETE', auth: true }),

  listShops: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/api/shops${qs ? `?${qs}` : ''}`);
  },
  shopsMeta: () => request('/api/shops/meta'),
  getShop: (slug) => request(`/api/shops/${slug}`),
  myShops: () => request('/api/shops/mine', { auth: true }),
  updateShop: (slug, data) => request(`/api/shops/${slug}`, { method: 'PATCH', auth: true, body: data }),
  uploadShopPhoto: (slug, file) => uploadFile(`/api/shops/${slug}/photo`, file),
  trackShopEvent: (slug, type, target) => request(`/api/shops/${slug}/track`, { method: 'POST', body: { type, target } }),
  shopAnalytics: (slug) => request(`/api/shops/${slug}/analytics`, { auth: true }),
  listPremiumShops: () => request('/api/shops/admin/premium', { auth: true }),
  toggleShopPremium: (slug, isPremium) => request(`/api/shops/${slug}/premium`, { method: 'PATCH', auth: true, body: { isPremium } }),
  remindShopOwners: () => request('/api/shops/admin/remind-owners', { method: 'POST', auth: true }),

  listArticles: () => request('/api/articles'),
  listAdminArticles: () => request('/api/articles/admin', { auth: true }),
  getArticle: (slug) => request(`/api/articles/${slug}`, { auth: true }),
  createArticle: (data) => request('/api/articles', { method: 'POST', auth: true, body: data }),
  updateArticle: (id, data) => request(`/api/articles/${id}`, { method: 'PATCH', auth: true, body: data }),
  deleteArticle: (id) => request(`/api/articles/${id}`, { method: 'DELETE', auth: true }),

  searchUsers: (query) => request(`/api/users/admin/search?query=${encodeURIComponent(query)}`, { auth: true }),
  toggleUserPremium: (id, isPremium) => request(`/api/users/${id}/premium`, { method: 'PATCH', auth: true, body: { isPremium } }),

  listShopUserPhotos: (slug) => request(`/api/shops/${slug}/photos`),
  uploadShopUserPhoto: (slug, file) => uploadFile(`/api/shops/${slug}/photos`, file),
  listAllPhotos: () => request('/api/photos', { auth: true }),
  approvePhoto: (id) => request(`/api/photos/${id}/approve`, { method: 'PATCH', auth: true }),
  rejectPhoto: (id) => request(`/api/photos/${id}/reject`, { method: 'PATCH', auth: true }),

  claimShop: (shopId, message) => request('/api/claims', { method: 'POST', auth: true, body: { shopId, message } }),
  myClaims: () => request('/api/claims/mine', { auth: true }),
  listClaims: () => request('/api/claims', { auth: true }),
  approveClaim: (id) => request(`/api/claims/${id}/approve`, { method: 'PATCH', auth: true }),
  rejectClaim: (id) => request(`/api/claims/${id}/reject`, { method: 'PATCH', auth: true }),

  listFavorites: () => request('/api/favorites', { auth: true }),
  toggleFavorite: (shopId) => request(`/api/favorites/${shopId}`, { method: 'POST', auth: true }),

  listVisits: () => request('/api/visits', { auth: true }),
  toggleVisit: (shopId) => request(`/api/visits/${shopId}`, { method: 'POST', auth: true }),

  listReviews: (slug) => request(`/api/shops/${slug}/reviews`),
  addReview: (slug, rating, text) => request(`/api/shops/${slug}/reviews`, { method: 'POST', auth: true, body: { rating, text } }),
  replyToReview: (slug, reviewId, reply) => request(`/api/shops/${slug}/reviews/${reviewId}/reply`, { method: 'PATCH', auth: true, body: { reply } }),
  flagReview: (slug, reviewId, reason) => request(`/api/shops/${slug}/reviews/${reviewId}/flag`, { method: 'POST', auth: true, body: { reason } }),

  listFlags: () => request('/api/flags', { auth: true }),
  dismissFlag: (id) => request(`/api/flags/${id}/dismiss`, { method: 'PATCH', auth: true }),
  removeFlaggedReview: (id) => request(`/api/flags/${id}/remove`, { method: 'PATCH', auth: true }),

  listEvents: () => request('/api/events'),
  listAdminEvents: () => request('/api/events/admin', { auth: true }),
  getEvent: (slug) => request(`/api/events/${slug}`, { auth: true }),
  createEvent: (data) => request('/api/events', { method: 'POST', auth: true, body: data }),
  updateEvent: (id, data) => request(`/api/events/${id}`, { method: 'PATCH', auth: true, body: data }),
  deleteEvent: (id) => request(`/api/events/${id}`, { method: 'DELETE', auth: true }),

  listGear: () => request('/api/gear'),
  listAdminGear: () => request('/api/gear/admin', { auth: true }),
  createGearItem: (data) => request('/api/gear', { method: 'POST', auth: true, body: data }),
  updateGearItem: (id, data) => request(`/api/gear/${id}`, { method: 'PATCH', auth: true, body: data }),
  deleteGearItem: (id) => request(`/api/gear/${id}`, { method: 'DELETE', auth: true }),

  submitShop: (payload) => request('/api/submissions', { method: 'POST', auth: true, body: payload }),
  listSubmissions: () => request('/api/submissions', { auth: true }),
  approveSubmission: (id) => request(`/api/submissions/${id}/approve`, { method: 'PATCH', auth: true }),
  rejectSubmission: (id) => request(`/api/submissions/${id}/reject`, { method: 'PATCH', auth: true }),

  nearbyShops: (lat, lon, radius) =>
    request(`/api/nearby?lat=${lat}&lon=${lon}${radius ? `&radius=${radius}` : ''}`),

  registerDeviceToken: (token) => request('/api/notifications/register', { method: 'POST', auth: true, body: { token } }),
  sendTestNotification: () => request('/api/notifications/test', { method: 'POST', auth: true }),
};
