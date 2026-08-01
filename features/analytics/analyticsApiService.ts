import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { analyticsEndpoints } from "./analyticsEndpoints";

export const analyticsApiService = createApi({
  reducerPath: "analyticsApiService",
  baseQuery: createBaseQuery(),
  tagTypes: ["Analytics"],
  endpoints: analyticsEndpoints,
});

export const { useGetDashboardMetricsQuery } = analyticsApiService;
