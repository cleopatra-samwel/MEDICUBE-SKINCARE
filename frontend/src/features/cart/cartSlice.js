import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { accountService } from '@/services/accountService';

const STORAGE_KEY = 'cart_v1';

const load = () => {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export const persistCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full or blocked: cart still works for this visit */
  }
};

/** Snapshot kept in the browser. Prices shown here are refreshed by the server quote at cart/checkout. */
const toCartItem = (product, quantity) => ({
  productId: product.id,
  slug: product.slug,
  name: product.name,
  image: product.image || product.images?.[0]?.url,
  price: product.price,
  size: product.size,
  maxQuantity: product.max_quantity ?? 99,
  quantity,
});

/** After sign-in: merge the guest cart with the saved account cart. */
export const mergeServerCart = createAsyncThunk('cart/mergeServer', async (_, { getState }) => {
  const server = await accountService.cart();
  const local = getState().cart.items;
  const merged = new Map(local.map((i) => [i.productId, { ...i }]));
  for (const line of server.lines.filter((l) => l.available)) {
    const existing = merged.get(line.product_id);
    merged.set(line.product_id, {
      productId: line.product_id,
      slug: line.slug,
      name: line.name,
      image: line.image,
      price: line.unit_price,
      maxQuantity: Math.min(line.stock, 99),
      quantity: Math.min(Math.max(existing?.quantity ?? 0, line.quantity), line.stock),
    });
  }
  const items = [...merged.values()];
  await accountService.syncCart(items);
  return items;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: load(), lastAddedAt: 0 },
  reducers: {
    addItem: (state, { payload: { product, quantity = 1 } }) => {
      const existing = state.items.find((i) => i.productId === product.id);
      const max = product.max_quantity ?? 99;
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, max);
        existing.price = product.price;
      } else {
        state.items.push(toCartItem(product, Math.min(quantity, max)));
      }
      state.lastAddedAt = Date.now();
    },
    setQuantity: (state, { payload: { productId, quantity } }) => {
      const item = state.items.find((i) => i.productId === productId);
      if (item) item.quantity = Math.max(1, Math.min(quantity, item.maxQuantity || 99));
    },
    removeItem: (state, { payload: productId }) => {
      state.items = state.items.filter((i) => i.productId !== productId);
    },
    /** Apply the server's quote: fresh prices, stock limits, drop unavailable lines. */
    reconcile: (state, { payload: lines }) => {
      const byId = new Map(lines.map((l) => [l.product_id, l]));
      state.items = state.items
        .filter((i) => byId.get(i.productId)?.available)
        .map((i) => {
          const l = byId.get(i.productId);
          return { ...i, price: l.unit_price, maxQuantity: Math.min(l.stock, 99), quantity: Math.min(i.quantity, l.stock), image: l.image || i.image };
        });
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (b) => {
    b.addCase(mergeServerCart.fulfilled, (state, { payload }) => {
      state.items = payload;
    });
  },
});

export const { addItem, setQuantity, removeItem, reconcile, clearCart } = cartSlice.actions;

export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = createSelector(selectCartItems, (items) => items.reduce((n, i) => n + i.quantity, 0));
export const selectCartSubtotal = createSelector(selectCartItems, (items) => items.reduce((n, i) => n + i.price * i.quantity, 0));
export default cartSlice.reducer;
