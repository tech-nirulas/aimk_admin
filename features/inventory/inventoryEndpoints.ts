import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

export const inventoryEndpoints = (builder: EndpointBuilder<any, any, any>) => ({
  getBatches: builder.query({
    query: ({
      page = 1,
      limit = 10,
      outletId,
      productId,
      status,
    }: {
      page?: number;
      limit?: number;
      outletId?: string;
      productId?: string;
      status?: string;
    }) => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (outletId) params.append("outletId", outletId);
      if (productId) params.append("productId", productId);
      if (status) params.append("status", status);

      return {
        url: `/inventory/batch?${params.toString()}`,
        method: "GET",
      };
    },
    providesTags: ["InventoryBatch"],
  }),
  createBatch: builder.mutation({
    query: (body: any) => ({
      url: `/inventory/batch`,
      method: "POST",
      body,
    }),
    invalidatesTags: ["InventoryBatch"],
  }),
  updateBatch: builder.mutation({
    query: ({ id, ...body }: { id: string; [key: string]: any }) => ({
      url: `/inventory/batch/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["InventoryBatch"],
  }),
  deleteBatch: builder.mutation({
    query: (id: string) => ({
      url: `/inventory/batch/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["InventoryBatch"],
  }),
});
