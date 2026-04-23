import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { productsEndpoints } from "./productsEndpoints";

const baseQuery = createBaseQuery();

export const productApiService = createApi({
  reducerPath: "productApiService",
  baseQuery,
  tagTypes: ["Product"],
  endpoints: productsEndpoints,
});

export const {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useGetPaginatedProductQuery,
  useGetProductQuery,
  useUpdateProductMutation,
  useLazyGetAllProductsQuery,
  useLazyGetPaginatedProductQuery,
  useLazyGetProductQuery,
} = productApiService;
