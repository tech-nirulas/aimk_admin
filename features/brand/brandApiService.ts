import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { brandEndpoints } from "./brandEndpoints";

const baseQuery = createBaseQuery();

export const brandApiService = createApi({
  reducerPath: "brandApiService",
  baseQuery,
  tagTypes: ["Brand"],
  endpoints: brandEndpoints,
});

export const {
  useCreateBrandMutation,
  useGetAllBrandsPaginatedQuery,
  useGetAllBrandsQuery,
  useGetBrandQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useLazyGetAllBrandsQuery,
  useLazyGetBrandQuery,
  useLazyGetAllBrandsPaginatedQuery,
} = brandApiService;
