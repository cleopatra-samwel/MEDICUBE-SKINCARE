import api from './api';

export const accountService = {
  updateProfile: (data) => api.put('/account/profile', data).then((r) => r.data),
  changePassword: (data) => api.put('/account/password', data).then((r) => r.data),
  addresses: () => api.get('/account/addresses').then((r) => r.data),
  createAddress: (data) => api.post('/account/addresses', data).then((r) => r.data),
  updateAddress: (id, data) => api.put(`/account/addresses/${id}`, data).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/account/addresses/${id}`).then((r) => r.data),
  orders: (page = 1) => api.get('/account/orders', { params: { page } }).then((r) => r.data),
  order: (orderNumber) => api.get(`/account/orders/${orderNumber}`).then((r) => r.data),
  wishlist: () => api.get('/account/wishlist').then((r) => r.data),
  addToWishlist: (productId) => api.post('/account/wishlist', { product_id: productId }).then((r) => r.data),
  removeFromWishlist: (productId) => api.delete(`/account/wishlist/${productId}`).then((r) => r.data),
  cart: () => api.get('/account/cart').then((r) => r.data),
  syncCart: (items) =>
    api.put('/account/cart', { items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })) }).then((r) => r.data),
};
