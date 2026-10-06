import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { accountService } from '@/services/accountService';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => (await accountService.wishlist()).data);

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (product, { getState }) => {
  const saved = getState().wishlist.ids.includes(product.id);
  if (saved) await accountService.removeFromWishlist(product.id);
  else await accountService.addToWishlist(product.id);
  return { product, saved: !saved };
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { ids: [], products: [], loaded: false },
  reducers: {
    resetWishlist: () => ({ ids: [], products: [], loaded: false }),
  },
  extraReducers: (b) => {
    b.addCase(fetchWishlist.fulfilled, (state, { payload }) => {
      state.products = payload;
      state.ids = payload.map((p) => p.id);
      state.loaded = true;
    }).addCase(toggleWishlist.fulfilled, (state, { payload: { product, saved } }) => {
      if (saved) {
        state.ids.push(product.id);
        state.products.unshift(product);
      } else {
        state.ids = state.ids.filter((id) => id !== product.id);
        state.products = state.products.filter((p) => p.id !== product.id);
      }
    });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
