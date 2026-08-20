import { orderApiService } from "@/features/order/orderApiService";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const paymentEndpoints = (builder: EndpointDefinitions) => ({
  getPayments: builder.query<
    any,
    {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  >({
    query: (params) => ({
      url: "payment",
      method: "GET",
      params,
    }),
    providesTags: ["Payment"],
  }),

  getPayment: builder.query<any, { id: string }>({
    query: ({ id }) => ({
      url: `payment/${id}`,
      method: "GET",
    }),
    providesTags: ["Payment"],
  }),

  refundPayment: builder.mutation<any, { orderId: string }>({
    query: ({ orderId }) => ({
      url: `payment/refund/${orderId}`,
      method: "POST",
    }),
    invalidatesTags: ["Payment"],
    // A refund changes the order's status too, and orders live in a separate
    // api service with its own tag registry.
    async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
      try {
        await queryFulfilled;
        dispatch(orderApiService.util.invalidateTags(["Order"]));
      } catch {
        // Failed refund changed nothing; leave both caches alone.
      }
    },
  }),

  markCodCollected: builder.mutation<any, { orderId: string }>({
    query: ({ orderId }) => ({
      url: `payment/collect-cod/${orderId}`,
      method: "POST",
    }),
    invalidatesTags: ["Payment"],
    async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
      try {
        await queryFulfilled;
        dispatch(orderApiService.util.invalidateTags(["Order"]));
      } catch {
        // Nothing was collected; caches stay as they are.
      }
    },
  }),
});