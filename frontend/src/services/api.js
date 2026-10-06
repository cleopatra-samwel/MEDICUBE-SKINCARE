import axios from 'axios';

const TOKEN_KEY = 'auth_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { Accept: 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Listeners (the store) are told when the server rejects the token.
const unauthorizedListeners = new Set();
export const onUnauthorized = (fn) => {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear();
      unauthorizedListeners.forEach((fn) => fn());
    }
    return Promise.reject(normalizeError(error));
  },
);

/** Every rejected request becomes { message, errors, status } for easy display. */
function normalizeError(error) {
  if (!error.response) {
    return { status: 0, message: 'Cannot reach the server. Check your connection and try again.', errors: {} };
  }
  const { status, data } = error.response;
  const fallback = {
    403: 'Access denied.',
    404: 'We could not find what you were looking for.',
    419: 'Your session expired. Refresh the page and try again.',
    422: 'Please check the highlighted fields.',
    429: 'Too many attempts. Wait a minute and try again.',
  }[status] || 'Something went wrong on our side. Please try again.';
  return { status, message: data?.message || fallback, errors: data?.errors || {} };
}

/** Map Laravel validation errors onto antd Form fields. */
export const toFormErrors = (errors = {}) =>
  Object.entries(errors).map(([name, messages]) => ({ name: name.split('.'), errors: messages }));

export default api;
