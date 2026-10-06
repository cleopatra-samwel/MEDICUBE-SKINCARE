import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import authReducer, { adminLogin, login, logout, register, restoreSession, sessionExpired } from '@/features/auth/authSlice';
import cartReducer, { addItem, clearCart, mergeServerCart, persistCart, reconcile, removeItem, setQuantity } from '@/features/cart/cartSlice';
import wishlistReducer, { fetchWishlist, resetWishlist } from '@/features/wishlist/wishlistSlice';
import uiReducer from '@/features/ui/uiSlice';
import { accountService } from '@/services/accountService';
import { onUnauthorized } from '@/services/api';

const listener = createListenerMiddleware();

// Persist the cart for guests, and keep the account cart in step for customers.
listener.startListening({
  matcher: isAnyOf(addItem, setQuantity, removeItem, reconcile, clearCart, mergeServerCart.fulfilled),
  effect: async (action, api) => {
    const { cart, auth } = api.getState();
    persistCart(cart.items);
    if (auth.user?.role === 'customer' && !mergeServerCart.fulfilled.match(action)) {
      api.cancelActiveListeners();
      await api.delay(600); // debounce rapid quantity clicks
      accountService.syncCart(api.getState().cart.items).catch(() => {});
    }
  },
});

// After a customer signs in (or the session is restored): merge carts, load wishlist.
listener.startListening({
  matcher: isAnyOf(login.fulfilled, register.fulfilled, restoreSession.fulfilled),
  effect: async (_, api) => {
    if (api.getState().auth.user?.role !== 'customer') return;
    api.dispatch(mergeServerCart());
    api.dispatch(fetchWishlist());
  },
});

listener.startListening({
  matcher: isAnyOf(logout.fulfilled, logout.rejected, sessionExpired, adminLogin.fulfilled),
  effect: async (_, api) => {
    api.dispatch(resetWishlist());
  },
});

export const store = configureStore({
  reducer: { auth: authReducer, cart: cartReducer, wishlist: wishlistReducer, ui: uiReducer },
  middleware: (getDefault) => getDefault().prepend(listener.middleware),
});

onUnauthorized(() => store.dispatch(sessionExpired()));
