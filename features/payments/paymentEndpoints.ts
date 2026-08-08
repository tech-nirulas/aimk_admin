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
  }),
});