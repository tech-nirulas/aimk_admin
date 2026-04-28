import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { discountEndpoints } from "./discountEndpoints";

const baseQuery = createBaseQuery();

export const discountApiService = createApi({
  reducerPath: "discountApiService",
  baseQuery,
  tagTypes: ["Discount"],
  endpoints: discountEndpoints,
});

export const {
  useCreateDiscountMutation,
  useGetAllDiscountsQuery,
  useGetDiscountQuery,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetAllDiscountsPaginatedQuery,
  useLazyGetAllDiscountsPaginatedQuery,
  useLazyGetDiscountQuery,
  useLazyGetAllDiscountsQuery,
} = discountApiService;
