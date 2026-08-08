import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

export const reviewEndpoints = (builder: EndpointBuilder<any, any, any>) => ({
  getAdminReviews: builder.query({
    query: (params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => ({
      url: `/review/admin`,
      method: "GET",
      params,
    }),
    providesTags: ["Review"],
  }),
  deleteReview: builder.mutation({
    query: ({ id }: { id: string }) => ({
      url: `/review/admin/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Review"],
  }),
});
