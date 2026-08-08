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

function extractPermissions(payload: any): string[] {
  if (!payload) return [];

  let perms: string[] = [];
  if (Array.isArray(payload.permissions) && payload.permissions.length > 0) {
    perms = payload.permissions.map((p: any) =>
      typeof p === 'string' ? p : `${p.subject}:${p.action}`
    );
  } else if (
    payload.role?.rolePermissionsV2 &&
    Array.isArray(payload.role.rolePermissionsV2) &&
    payload.role.rolePermissionsV2.length > 0
  ) {
    perms = payload.role.rolePermissionsV2.map((rp: any) =>
      typeof rp === 'string' ? rp : rp.permission
    );
  } else if (
    payload.role?.permissions &&
    Array.isArray(payload.role.permissions) &&
    payload.role.permissions.length > 0
  ) {
    perms = payload.role.permissions.map((p: any) =>
      typeof p === 'string' ? p : `${p.subject}:${p.action}`
    );
  }

  if (payload.role?.name === 'super_admin' && !perms.includes('*')) {
    perms.push('*');
  }

  return perms;
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