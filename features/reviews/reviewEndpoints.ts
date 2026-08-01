import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

export const reviewEndpoints = (builder: EndpointBuilder<any, any, any>) => ({
  getAdminReviews: builder.query({
    query: ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => ({
      url: `/review/admin?page=${page}&limit=${limit}`,
      method: "GET",
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
