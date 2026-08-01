import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { cakeEndpoints } from "./cakeEndpoints";

const baseQuery = createBaseQuery();

export const cakeApiService = createApi({
  reducerPath: "cakeApiService",
  baseQuery,
  tagTypes: ["CakeCustomization"],
  endpoints: cakeEndpoints,
});

export const {
  useGetCakeCustomizationsQuery,
  useGetCakeCustomizationQuery,
  useUpdateCakeCustomizationMutation,
} = cakeApiService;
