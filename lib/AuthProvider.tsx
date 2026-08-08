// lib/AuthProvider.tsx
"use client";

import { useLazyFetchUserQuery, useLogoutBackendMutation, useRefreshTokenMutation } from '@/features/auth/authApiService';
import { logout, setLoading, setUser } from '@/features/auth/authSlice';
import getDecryptedToken from '@/helpers/decryptToken.helper';
import { getRefreshToken, saveEncryptedToken, saveRefreshToken } from '@/helpers/encryptToken.helper';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from './store';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  checkAuth: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const authState = useAppSelector((state: any) => state.authReducer);
  const { isAuthenticated = false, isLoading = true, user = null } = authState || {};

  const [fetchUser, { isLoading: isFetchingUser }] = useLazyFetchUserQuery();
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const [logoutBackendMutation] = useLogoutBackendMutation();

  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const checkAuth = async () => {
    try {
      dispatch(setLoading(true));
      let token = await getDecryptedToken();

      if (!token) {
        // Attempt silent re-authentication via refresh token if present
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const refreshRes = await refreshTokenMutation(refreshToken).unwrap();
            if (refreshRes?.accessToken) {
              token = refreshRes.accessToken;
              await saveEncryptedToken(refreshRes.accessToken);
              if (refreshRes.refreshToken) {
                saveRefreshToken(refreshRes.refreshToken);
              }
            }
          } catch (_err) {
            token = null;
          }
        }
      }

      if (!token) {
        dispatch(logout());
        if (!isPublicRoute) {
          router.push('/login');
        }
        return;
      }

      // Fetch user data with token
      const userData = await fetchUser(token).unwrap();
      dispatch(setUser(userData));
    } catch (error: any) {
      // Access token expired - attempt silent refresh before giving up
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await refreshTokenMutation(refreshToken).unwrap();
          if (refreshRes?.accessToken) {
            await saveEncryptedToken(refreshRes.accessToken);
            if (refreshRes.refreshToken) {
              saveRefreshToken(refreshRes.refreshToken);
            }
            const userData = await fetchUser(refreshRes.accessToken).unwrap();
            dispatch(setUser(userData));
            return;
          }
        } catch (_err) {
          // Refresh failed
        }
      }

      // Session expired or invalid token - log out cleanly
      dispatch(logout());
      if (!isPublicRoute) {
        router.push('/login');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        logoutBackendMutation(refreshToken).catch(() => {});
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      router.push('/login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading: isLoading || isFetchingUser,
      user,
      checkAuth,
      handleLogout,
    }),
    [isAuthenticated, isLoading, isFetchingUser, user]
  );

  // Show loading state while checking authentication
  if (isLoading && !isPublicRoute) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};