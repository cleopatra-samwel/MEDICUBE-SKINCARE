import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { catalogService } from '@/services/catalogService';

/** Delivery fees, regions and payment methods, loaded once per visit. */
export const fetchShopConfig = createAsyncThunk('ui/shopConfig', () => catalogService.config());

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, searchOpen: false, shopConfig: null },
  reducers: {
    openCart: (s) => { s.cartOpen = true; },
    closeCart: (s) => { s.cartOpen = false; },
    openSearch: (s) => { s.searchOpen = true; },
    closeSearch: (s) => { s.searchOpen = false; },
  },
  extraReducers: (b) => {
    b.addCase(fetchShopConfig.fulfilled, (s, { payload }) => { s.shopConfig = payload; });
  },
});

export const { openCart, closeCart, openSearch, closeSearch } = uiSlice.actions;
export default uiSlice.reducer;
