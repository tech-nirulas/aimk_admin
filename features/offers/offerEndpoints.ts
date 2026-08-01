import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const offerEndpoints = (builder: EndpointDefinitions) => ({
  getOffers: builder.query<any, { page: number; limit: number }>({
    query: (params) => ({
      url: "offer",
      method: "GET",
      params,
    }),
    providesTags: ["Offer"],
  }),

  getOffer: builder.query<any, { id: string }>({
    query: ({ id }) => ({
      url: `offer/${id}`,
      method: "GET",
    }),
    providesTags: ["Offer"],
  }),

  createOffer: builder.mutation<any, any>({
    query: (body) => ({
      url: "offer",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Offer"],
  }),

  updateOffer: builder.mutation<any, { id: string; [key: string]: any }>({
    query: ({ id, ...body }) => ({
      url: `offer/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["Offer"],
  }),

  deleteOffer: builder.mutation<any, { id: string }>({
    query: ({ id }) => ({
      url: `offer/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Offer"],
  }),
});
