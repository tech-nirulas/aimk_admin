import { createApi } from "@reduxjs/toolkit/query/react";
import createBaseQuery from "@/lib/baseQuery";
import { reviewEndpoints } from "./reviewEndpoints";

export const reviewApiService = createApi({
  reducerPath: "reviewApiService",
  baseQuery: createBaseQuery(),
  tagTypes: ["Review"],
  endpoints: reviewEndpoints,
});

export const {
  useGetAdminReviewsQuery,
  useDeleteReviewMutation,
} = reviewApiService;
