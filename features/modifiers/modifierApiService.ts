import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { modifierEndpoints } from "./modifierEndpoints";

const baseQuery = createBaseQuery();

export const modifierApiService = createApi({
  reducerPath: "modifierApiService",
  baseQuery,
  tagTypes: ["Modifier"],
  endpoints: modifierEndpoints,
});

export const {
  useGetModifiersQuery,
  useLazyGetModifiersQuery,
  useGetModifierQuery,
  useLazyGetModifierQuery,
  useCreateModifierMutation,
  useUpdateModifierMutation,
  useDeleteModifierMutation,
} = modifierApiService;
