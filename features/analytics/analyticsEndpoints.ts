import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

export const analyticsEndpoints = (builder: EndpointBuilder<any, any, any>) => ({
  getDashboardMetrics: builder.query({
    query: () => ({
      url: `/analytics/dashboard`,
      method: "GET",
    }),
    transformResponse: (response: any) => response?.data || response,
    providesTags: ["Analytics"],
  }),
});
