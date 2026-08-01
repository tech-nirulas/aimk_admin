import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { inventoryEndpoints } from "./inventoryEndpoints";

export const inventoryApiService = createApi({
  reducerPath: "inventoryApiService",
  baseQuery: createBaseQuery(),
  tagTypes: ["InventoryBatch"],
  endpoints: inventoryEndpoints,
});

export const {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
} = inventoryApiService;
