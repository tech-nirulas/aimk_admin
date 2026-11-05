import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const deliveryFeeEndpoints = (builder: EndpointDefinitions) => ({
  getDeliveryFeeRules: builder.query<any, void>({
    query: () => ({
      url: "delivery-fee-rules",
      method: "GET",
    }),
    providesTags: ["DeliveryFeeRule"],
  }),

  createDeliveryFeeRule: builder.mutation<any, any>({
    query: (body) => ({
      url: "delivery-fee-rules",
      method: "POST",
      body,
    }),
    invalidatesTags: ["DeliveryFeeRule"],
  }),

  updateDeliveryFeeRule: builder.mutation<any, { id: string; [key: string]: any }>({
    query: ({ id, ...body }) => ({
      url: `delivery-fee-rules/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["DeliveryFeeRule"],
  }),

  deleteDeliveryFeeRule: builder.mutation<any, { id: string }>({
    query: ({ id }) => ({
      url: `delivery-fee-rules/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["DeliveryFeeRule"],
  }),
});
