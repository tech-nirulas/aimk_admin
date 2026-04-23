// features/auth/authApiService.ts (frontend update)
import { LoginRequest, LoginResponse } from "@/interfaces/auth.interface";
import { Root } from "@/interfaces/root.interface";
import { API_BASE_URL } from "@/utils/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
});

export const authApiService = createApi({
  reducerPath: "authApi",
  baseQuery,
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
        console.log("🚀 ~ token 2:", token);
        return {
          url: "auth/user",
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
    }),
    verifyToken: builder.mutation({
      query: (token) => ({
        url: "auth/verify",
        method: "POST",
        body: { token },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useFetchUserQuery,
  useLazyFetchUserQuery,
  useVerifyTokenMutation,
} = authApiService;
