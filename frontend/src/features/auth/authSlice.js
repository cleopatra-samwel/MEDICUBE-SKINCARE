import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import { tokenStore } from '@/services/api';

const saveSession = ({ token, user }) => {
  tokenStore.set(token);
  return user;
};

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    saveSession(res);
    return res;
  } catch (e) {
    return rejectWithValue(e);
  }
});

export const adminLogin = createAsyncThunk('auth/adminLogin', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.adminLogin(data);
    saveSession(res);
    return res;
  } catch (e) {
    return rejectWithValue(e);
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    saveSession(res);
    return res;
  } catch (e) {
    return rejectWithValue(e);
  }
});

/** On app start: confirm the stored token with the server (never trust local role data). */
export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  if (!tokenStore.get()) return null;
  try {
    return await authService.me();
  } catch (e) {
    tokenStore.clear();
    return rejectWithValue(e);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } finally {
    tokenStore.clear();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: tokenStore.get() ? 'checking' : 'ready' },
  reducers: {
    sessionExpired: (state) => {
      state.user = null;
      state.status = 'ready';
    },
    userUpdated: (state, { payload }) => {
      state.user = payload;
    },
  },
  extraReducers: (b) => {
    const signedIn = (state, { payload }) => {
      state.user = payload.user;
      state.status = 'ready';
    };
    b.addCase(login.fulfilled, signedIn)
      .addCase(adminLogin.fulfilled, signedIn)
      .addCase(register.fulfilled, signedIn)
      .addCase(restoreSession.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.status = 'ready';
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.status = 'ready';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
      });
  },
});

export const { sessionExpired, userUpdated } = authSlice.actions;
export const selectUser = (s) => s.auth.user;
export const selectAuthReady = (s) => s.auth.status === 'ready';
export const selectIsStaff = (s) => ['admin', 'super_admin'].includes(s.auth.user?.role);
export default authSlice.reducer;
