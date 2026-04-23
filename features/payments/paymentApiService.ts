import { createApi } from "@reduxjs/toolkit/query/react";
import createBaseQuery from "@/lib/baseQuery";
import { paymentEndpoints } from "./paymentEndpoints";

export const paymentApiService = createApi({
  reducerPath: "paymentApiService",
  baseQuery: createBaseQuery(),
  tagTypes: ["Payment"],
  endpoints: paymentEndpoints,
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
} = paymentApiService;