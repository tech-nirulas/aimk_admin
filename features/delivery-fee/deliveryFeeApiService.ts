import { createApi } from "@reduxjs/toolkit/query/react";
import createBaseQuery from "@/lib/baseQuery";
import { deliveryFeeEndpoints } from "./deliveryFeeEndpoints";

export const deliveryFeeApiService = createApi({
  reducerPath: "deliveryFeeApiService",
  baseQuery: createBaseQuery(),
  tagTypes: ["DeliveryFeeRule"],
  endpoints: deliveryFeeEndpoints,
});

export const {
  useGetDeliveryFeeRulesQuery,
  useCreateDeliveryFeeRuleMutation,
  useUpdateDeliveryFeeRuleMutation,
  useDeleteDeliveryFeeRuleMutation,
} = deliveryFeeApiService;
