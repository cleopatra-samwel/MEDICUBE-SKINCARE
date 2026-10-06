import api from './api';

const toLines = (items) => items.map((i) => ({ product_id: i.productId, quantity: i.quantity }));

export const orderService = {
  quote: (items, region) => api.post('/cart/quote', { items: toLines(items), region }).then((r) => r.data),
  checkout: (form, items) => api.post('/checkout', { ...form, items: toLines(items) }).then((r) => r.data),
  initiatePayment: (orderNumber, data) => api.post(`/orders/${orderNumber}/payments`, data).then((r) => r.data),
  paymentStatus: (orderNumber, phone) =>
    api.get(`/orders/${orderNumber}/payment-status`, { params: { phone } }).then((r) => r.data),
  track: (order_number, phone) => api.post('/track-order', { order_number, phone }).then((r) => r.data),
};
