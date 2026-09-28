// features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApiService } from './authApiService';
import { User } from '@/interfaces/user.interface';
import { clearTokens } from '@/helpers/encryptToken.helper';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
};

/**
 * The backend resolves a role's effective permissions (including parent-role inheritance) and
 * returns them as a flat `permissions` array. That array is the only accepted source, so the UI
 * and the API guard can never disagree about what a user may do.
 */
function extractPermissions(payload: any): string[] {
  if (!payload || !Array.isArray(payload.permissions)) return [];
  return payload.permissions.filter((p: unknown): p is string => typeof p === 'string');
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string;
        permissions?: string[];
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.permissions =
        action.payload.permissions || extractPermissions(action.payload.user);
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.permissions = extractPermissions(action.payload);
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.isLoading = false;
      clearTokens();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApiService.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        const data = (payload as any)?.data || payload;
        if (data?.accessToken) {
          state.token = data.accessToken;
        }
        if (data?.refreshToken) {
          state.refreshToken = data.refreshToken;
        }
      }
    );
    builder.addMatcher(
      authApiService.endpoints.fetchUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
        state.permissions = extractPermissions(payload);
        state.isAuthenticated = true;
        state.isLoading = false;
      }
    );
  },
});

export const { setCredentials, setUser, setToken, logout, setLoading } =
  authSlice.actions;
export default authSlice.reducer;