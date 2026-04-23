import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { outletEndpoints } from "./outletsEndpoints";

const baseQuery = createBaseQuery();

export const outletApiService = createApi({
  reducerPath: "outletApiService",
  baseQuery,
  tagTypes: ["Outlet"],
  endpoints: outletEndpoints,
});

export const {
  useCreateOutletMutation,
  useDeleteOutletMutation,
  useGetAllOutletsQuery,
  useGetOutletQuery,
  useLazyGetAllOutletsQuery,
  useLazyGetOutletQuery,
  useUpdateOutletMutation,
} = outletApiService;
