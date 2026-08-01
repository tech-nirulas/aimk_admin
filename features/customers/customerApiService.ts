import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { customerEndpoints } from "./customerEndpoints";

export const customerApiService = createApi({
  reducerPath: "customerApiService",
  baseQuery: createBaseQuery(),
  tagTypes: ["Customer"],
  endpoints: customerEndpoints,
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerLoyaltyMutation,
} = customerApiService;
