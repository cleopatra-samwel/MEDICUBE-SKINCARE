const tsh = new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 });

/** 35000 → "TSh 35,000" */
export const formatPrice = (amount) => `TSh ${tsh.format(Math.round(Number(amount) || 0))}`;

export const formatDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Intl.DateTimeFormat('en-GB', opts).format(new Date(iso)) : '—';

export const formatDateTime = (iso) =>
  formatDate(iso, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const humanize = (value = '') =>
  value.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export const TZ_PHONE = /^(?:\+?255|0)[67]\d{8}$/;
export const cleanPhone = (v = '') => v.replace(/[\s\-()]/g, '');
