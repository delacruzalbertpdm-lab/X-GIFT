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
    let errorMsg = 'Something went wrong';
    if (data?.error) {
      errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    } else if (data?.detail) {
      errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } else if (data && typeof data === 'object') {
      try {
        const values = Object.values(data).flat();
        if (values.length > 0) {
          errorMsg = values.join(', ');
        }
      } catch (e) {
        errorMsg = 'Error processing request';
      }
    } else if (response.statusText) {
      errorMsg = `Server error (${response.status}: ${response.statusText})`;
    }
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

  // Hamster Verification Quiz
  getQuizQuestions: () => request('/quiz/questions/'),
  submitQuiz: (answers) => request('/quiz/submit/', {
    method: 'POST',
    body: JSON.stringify({ answers }),
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
  adminGetQuestions: () => request('/admin/questions/'),
  adminCreateQuestion: (data) => request('/admin/questions/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  adminUpdateQuestion: (id, data) => request(`/admin/questions/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  adminDeleteQuestion: (id) => request(`/admin/questions/${id}/`, {
    method: 'DELETE',
  }),
  adminResetUserQuiz: (userId) => request(`/admin/users/${userId}/reset-quiz/`, {
    method: 'POST',
  }),
};
