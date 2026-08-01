import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const cakeEndpoints = (builder: EndpointDefinitions) => ({
  getCakeCustomizations: builder.query<
    any,
    {
      page?: number;
      limit?: number;
      status?: string;
    }
  >({
    query: (params) => ({
      url: "cake-customization",
      method: "GET",
      params: {
        ...(params.page && { page: params.page }),
        ...(params.limit && { limit: params.limit }),
        ...(params.status && { status: params.status }),
      },
    }),
    providesTags: ["CakeCustomization"],
  }),

  getCakeCustomization: builder.query<any, { id: string }>({
    query: ({ id }) => ({
      url: `cake-customization/${id}`,
      method: "GET",
    }),
    providesTags: ["CakeCustomization"],
  }),

  updateCakeCustomization: builder.mutation<
    any,
    {
      id: string;
      status?: string;
      adminNotes?: string;
      assignedOutletId?: string;
    }
  >({
    query: ({ id, ...body }) => ({
      url: `cake-customization/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["CakeCustomization"],
  }),
});
