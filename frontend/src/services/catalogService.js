import api from './api';

export const catalogService = {
  config: () => api.get('/shop/config').then((r) => r.data),
  categories: () => api.get('/categories').then((r) => r.data),
  products: (params) => api.get('/products', { params }).then((r) => r.data),
  product: (key) => api.get(`/products/${key}`).then((r) => r.data),
  related: (key) => api.get(`/products/${key}/related`).then((r) => r.data),
  reviews: (productId, page = 1) => api.get(`/products/${productId}/reviews`, { params: { page } }).then((r) => r.data),
  submitReview: (productId, data) => api.post(`/products/${productId}/reviews`, data).then((r) => r.data),
  featuredReviews: () => api.get('/reviews/featured').then((r) => r.data),
  subscribe: (email) => api.post('/newsletter', { email }).then((r) => r.data),
  contact: (data) => api.post('/contact', data).then((r) => r.data),
};
