import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { legalEntitiesEndpoints } from "./legalEntitiesEndpoints";

const baseQuery = createBaseQuery();

export const legalEntityApiService = createApi({
  reducerPath: "legalEntityApiService",
  baseQuery,
  tagTypes: ["LegalEntity"],
  endpoints: legalEntitiesEndpoints,
});

export const {
  useCreateLegalEntityMutation,
  useGetAllLegalEntitiesQuery,
  useGetLegalEntityQuery,
  useDeleteLegalEntityMutation,
  useUpdateLegalEntityMutation,
  useLazyGetAllLegalEntitiesQuery,
  useLazyGetLegalEntityQuery,
  useGetAllLegalEntitiesPaginatedQuery,
  useLazyGetAllLegalEntitiesPaginatedQuery,
} = legalEntityApiService;
