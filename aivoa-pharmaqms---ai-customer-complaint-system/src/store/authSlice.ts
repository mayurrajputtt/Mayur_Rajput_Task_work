import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, authService } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialUser = authService.getCurrentUser();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
