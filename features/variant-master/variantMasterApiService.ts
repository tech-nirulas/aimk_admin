import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { variantMasterEndpoints } from "./variantMasterEndpoints";

const baseQuery = createBaseQuery();

export const variantMasterApiService = createApi({
  reducerPath: "variantMasterApiService",
  baseQuery,
  tagTypes: ["VariantMaster", "VariantMasterProduct", "Product"],
  endpoints: variantMasterEndpoints,
});

export const {
  useGetVariantMastersQuery,
  useLazyGetVariantMastersQuery,
  useGetVariantMasterQuery,
  useLazyGetVariantMasterQuery,
  useCreateVariantMasterMutation,
  useUpdateVariantMasterMutation,
  useDeleteVariantMasterMutation,
  useGetVariantMasterProductsQuery,
  useLazyGetVariantMasterProductsQuery,
  useAssignProductsToVariantMasterMutation,
  useUpdateVariantMasterProductMutation,
  useDetachProductFromVariantMasterMutation,
} = variantMasterApiService;
