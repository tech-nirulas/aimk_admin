import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

export const customerEndpoints = (builder: EndpointBuilder<any, any, any>) => ({
  getCustomers: builder.query({
    query: ({
      page = 1,
      limit = 10,
      search = "",
      sortBy,
      sortOrder,
    }: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      return {
        url: `/user/admin/customers?${params.toString()}`,
        method: "GET",
      };
    },
    providesTags: ["Customer"],
  }),
  getCustomerById: builder.query({
    query: (id: string) => ({
      url: `/user/admin/customers/${id}`,
      method: "GET",
    }),
    providesTags: ["Customer"],
  }),
  updateCustomerLoyalty: builder.mutation({
    query: ({ id, loyaltyPoints }: { id: string; loyaltyPoints: number }) => ({
      url: `/user/admin/customers/${id}/loyalty`,
      method: "PATCH",
      body: { loyaltyPoints },
    }),
    invalidatesTags: ["Customer"],
  }),
});
