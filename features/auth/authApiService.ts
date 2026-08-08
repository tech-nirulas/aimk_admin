// features/auth/authApiService.ts
import { baseQueryWithReauth } from "@/features/api/baseQuery";
import { LoginRequest, LoginResponse } from "@/interfaces/auth.interface";
import { Root } from "@/interfaces/root.interface";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApiService = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<Root<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    fetchUser: builder.query({
      query: (token) => {
        return {
          url: "auth/user",
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        };
      },
      transformResponse: (response: any) => response?.data || response,
    }),
    verifyToken: builder.mutation({
      query: (token) => ({
        url: "auth/verify",
        method: "POST",
        body: { token },
      }),
    }),
    refreshToken: builder.mutation({
      query: (refreshToken: string) => ({
        url: "auth/refresh",
        method: "POST",
        body: { refreshToken },
      }),
      transformResponse: (response: any) => response?.data || response,
    }),
    logoutBackend: builder.mutation({
      query: (refreshToken: string) => ({
        url: "auth/logout",
        method: "POST",
        body: { refreshToken },
      }),
    }),
    logoutAll: builder.mutation({
      query: () => ({
        url: "auth/logout-all",
        method: "POST",
      }),
    }),
    getSessions: builder.query({
      query: () => ({
        url: "auth/sessions",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response,
    }),
    revokeSession: builder.mutation({
      query: (sessionId: string) => ({
        url: `auth/sessions/${sessionId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useFetchUserQuery,
  useLazyFetchUserQuery,
  useVerifyTokenMutation,
  useRefreshTokenMutation,
  useLogoutBackendMutation,
  useLogoutAllMutation,
  useGetSessionsQuery,
  useLazyGetSessionsQuery,
  useRevokeSessionMutation,
} = authApiService;
