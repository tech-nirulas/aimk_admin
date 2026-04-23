import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const mediaEndpoints = (builder: EndpointDefinitions) => ({
  uploadMedia: builder.mutation({
    query: (body) => ({
      url: "media/upload",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Media"],
  }),
  getAllMedia: builder.query({
    query: () => ({
      url: "media",
      method: "GET",
    }),
    providesTags: ["Media"],
  }),
  getMediaFolders: builder.query({
    query: () => ({
      url: 'media/folders',
      method: "GET",
    }),
  }),
  getMediaByReferenceId: builder.query({
    query: ({ id }) => ({
      url: `media/reference/${id}`,
      method: "GET",
    }),
  }),
  getMediaById: builder.query({
    query: ({ id }) => ({
      url: `media/${id}`,
      method: "GET",
    }),
  }),
  updateMediaMetaData: builder.mutation({
    query: ({ id, body }) => ({
      url: `media/${id}`,
      method: "PATCH",
      body,
    }),
  }),

  deleteMedia: builder.mutation({
    query: ({ id }) => ({
      url: `media/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Media"],
  }),

  updateMediaReference: builder.mutation({
    query: ({ id }) => ({
      url: `media/${id}/reference`,
      method: "PATCH",
    }),
    invalidatesTags: ["Media"],
  }),

  bulkDeleteMedia: builder.mutation({
    query: ({ ids }) => ({
      url: `media/bulk-delete`,
      method: "POST",
      body: ids
    }),
    invalidatesTags: ["Media"],
  }),
});
