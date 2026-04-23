import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { mediaEndpoints } from "./mediaEndpoints";

const baseQuery = createBaseQuery();

export const mediaApiService = createApi({
  reducerPath: "mediaApiService",
  baseQuery,
  tagTypes: ["Media"],
  endpoints: mediaEndpoints,
});

export const {
  useBulkDeleteMediaMutation,
  useDeleteMediaMutation,
  useGetAllMediaQuery,
  useGetMediaByIdQuery,
  useGetMediaByReferenceIdQuery,
  useGetMediaFoldersQuery,
  useLazyGetAllMediaQuery,
  useLazyGetMediaByIdQuery,
  useLazyGetMediaByReferenceIdQuery,
  useLazyGetMediaFoldersQuery,
  useUpdateMediaReferenceMutation,
  useUpdateMediaMetaDataMutation,
  useUploadMediaMutation,
} = mediaApiService;
