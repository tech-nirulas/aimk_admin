import { createApi } from "@reduxjs/toolkit/query/react";
import createBaseQuery from "@/lib/baseQuery";
import { offerEndpoints } from "./offerEndpoints";

export const offerApiService = createApi({
  reducerPath: "offerApiService",
  baseQuery: createBaseQuery(),
  tagTypes: ["Offer"],
  endpoints: offerEndpoints,
});

export const {
  useGetOffersQuery,
  useGetOfferQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApiService;
