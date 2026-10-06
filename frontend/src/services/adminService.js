import api from './api';

const get = (url, params) => api.get(`/admin${url}`, { params }).then((r) => r.data);
const send = (method, url, data, config) => api[method](`/admin${url}`, data, config).then((r) => r.data);

export const adminService = {
  dashboard: () => get('/dashboard'),
  analytics: () => get('/analytics'),

  products: (params) => get('/products', params),
  product: (id) => get(`/products/${id}`),
  createProduct: (data) => send('post', '/products', data),
  updateProduct: (id, data) => send('put', `/products/${id}`, data),
  setProductStatus: (id, status) => send('patch', `/products/${id}/status`, { status }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
  uploadProductImages: (id, files) => {
    const form = new FormData();
    files.forEach((f) => form.append('images[]', f));
    return send('post', `/products/${id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  setPrimaryImage: (id, imageId) => send('patch', `/products/${id}/images/${imageId}/primary`),
  deleteProductImage: (id, imageId) => api.delete(`/admin/products/${id}/images/${imageId}`).then((r) => r.data),

  categories: () => get('/categories'),
  createCategory: (data) => send('post', '/categories', data),
  updateCategory: (id, data) => send('put', `/categories/${id}`, data),
  uploadCategoryImage: (id, file) => {
    const form = new FormData();
    form.append('image', file);
    return send('post', `/categories/${id}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),

  orders: (params) => get('/orders', params),
  order: (orderNumber) => get(`/orders/${orderNumber}`),
  updateOrderStatus: (orderNumber, status, note) => send('patch', `/orders/${orderNumber}/status`, { status, note }),

  payments: (params) => get('/payments', params),
  verifyPayment: (id) => send('post', `/payments/${id}/verify`),
  refundPayment: (id, reason) => send('post', `/payments/${id}/refund`, { reason }),

  customers: (params) => get('/customers', params),
  customer: (id) => get(`/customers/${id}`),
  setCustomerStatus: (id, status) => send('patch', `/customers/${id}/status`, { status }),

  deliveries: (params) => get('/deliveries', params),
  updateDelivery: (id, data) => send('patch', `/deliveries/${id}`, data),

  reviews: (params) => get('/reviews', params),
  setReviewStatus: (id, status) => send('patch', `/reviews/${id}/status`, { status }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),

  settings: () => get('/settings'),
  updateSettings: (data) => send('put', '/settings', data),
};
