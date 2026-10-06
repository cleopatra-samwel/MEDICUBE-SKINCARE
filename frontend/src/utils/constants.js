export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
export const PAYMENT_STATUSES = ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'];
export const PRODUCT_STATUSES = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'];
export const DELIVERY_STATUSES = ['PENDING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];

// Antd Tag colours per status, kept soft to match the palette.
export const STATUS_COLORS = {
  PENDING: 'default', PROCESSING: 'processing', CONFIRMED: 'geekblue', READY_FOR_DELIVERY: 'purple',
  OUT_FOR_DELIVERY: 'orange', DELIVERED: 'success', CANCELLED: 'error', PAID: 'success', FAILED: 'error',
  REFUNDED: 'magenta', ACTIVE: 'success', INACTIVE: 'default', OUT_OF_STOCK: 'warning',
  APPROVED: 'success', REJECTED: 'error', active: 'success', suspended: 'error',
};

export const SKIN_TYPES = ['All skin types', 'Dry', 'Oily', 'Combination', 'Normal', 'Sensitive', 'Mature', 'Dehydrated', 'Acne-prone'];

export const PRODUCT_SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Best selling' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];
