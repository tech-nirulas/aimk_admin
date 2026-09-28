import {
  CreateModifierGroupPayload,
  GetModifierGroupResponse,
  GetModifierGroupsResponse,
  UpdateModifierGroupPayload,
} from "@/interfaces/modifier.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const modifierEndpoints = (builder: EndpointDefinitions) => ({
  getModifiers: builder.query<
    GetModifierGroupsResponse,
    { brandId?: string } | void
  >({
    query: (params) => ({
      url: "modifiers",
      method: "GET",
      params: params?.brandId ? { brandId: params.brandId } : undefined,
    }),
    providesTags: ["Modifier"],
  }),

  getModifier: builder.query<GetModifierGroupResponse, { id: string }>({
    query: ({ id }) => ({
      url: `modifiers/${id}`,
      method: "GET",
    }),
    providesTags: ["Modifier"],
  }),

  createModifier: builder.mutation<
    GetModifierGroupResponse,
    CreateModifierGroupPayload
  >({
    query: (body) => ({
      url: "modifiers",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Modifier"],
  }),

  updateModifier: builder.mutation<
    GetModifierGroupResponse,
    { id: string; body: UpdateModifierGroupPayload }
  >({
    query: ({ id, body }) => ({
      url: `modifiers/${id}`,
      method: "PUT",
      body,
    }),
    invalidatesTags: ["Modifier"],
  }),

  deleteModifier: builder.mutation<any, { id: string }>({
    query: ({ id }) => ({
      url: `modifiers/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Modifier"],
  }),
});
