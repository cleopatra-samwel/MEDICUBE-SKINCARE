/**
 * Guests prove they own an order with the checkout phone number. We keep it in
 * sessionStorage (this tab only) so the payment and confirmation pages can
 * call the API without asking again.
 */
const key = (orderNumber) => `order_access_${orderNumber}`;

export const orderAccess = {
  save: (orderNumber, phone) => {
    try { sessionStorage.setItem(key(orderNumber), phone); } catch { /* private mode */ }
  },
  get: (orderNumber) => {
    try { return sessionStorage.getItem(key(orderNumber)) || ''; } catch { return ''; }
  },
};
