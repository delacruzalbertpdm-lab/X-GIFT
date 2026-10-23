const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/+$/, '')}/api` : '/api';

export const getAuthToken = () => localStorage.getItem('exchange_token');
export const setAuthToken = (token) => localStorage.setItem('exchange_token', token);
export const removeAuthToken = () => localStorage.removeItem('exchange_token');

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.detail || (typeof data === 'object' ? Object.values(data).flat().join(', ') : 'Something went wrong');
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  // Auth
  login: (username, password) => request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  register: (payload) => request('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getMe: () => request('/auth/me/'),

  // Wishlist
  getWishlist: () => request('/wishlist/'),
  addWishlistItem: (item) => request('/wishlist/', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  updateWishlistItem: (id, item) => request(`/wishlist/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  deleteWishlistItem: (id) => request(`/wishlist/${id}/`, {
    method: 'DELETE',
  }),

  // Lucky Draw
  getDrawStatus: () => request('/draw/status/'),
  pickDraw: () => request('/draw/pick/', {
    method: 'POST',
  }),

  // Admin
  getAdminOverview: () => request('/admin/overview/'),
  adminAutoMatchAll: () => request('/admin/auto-match-all/', {
    method: 'POST',
  }),
  adminResetMatches: (userId = null) => request('/admin/reset-matches/', {
    method: 'POST',
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  }),
  adminDeleteUser: (userId) => request(`/admin/users/${userId}/`, {
    method: 'DELETE',
  }),
};
