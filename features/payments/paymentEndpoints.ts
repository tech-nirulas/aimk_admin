import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const paymentEndpoints = (builder: EndpointDefinitions) => ({
  getPayments: builder.query<
    any,
    { page: number; limit: number }
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
});