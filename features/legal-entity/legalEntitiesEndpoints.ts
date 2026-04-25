import {
  CreateLegalEntityPayload,
  GetLegalEntitiesResponse,
  GetLegalEntityResponse,
  PaginatedLegalEntitiesResponse,
  UpdateLegalEntityPayload,
} from "@/interfaces/legal-entity.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const legalEntitiesEndpoints = (builder: EndpointDefinitions) => ({
  createLegalEntity: builder.mutation<
    GetLegalEntityResponse,
    CreateLegalEntityPayload
  >({
    query: (body) => ({
      url: "legal-entity",
      method: "POST",
      body,
    }),
    invalidatesTags: ["LegalEntity"],
  }),
  getAllLegalEntities: builder.query<
    GetLegalEntitiesResponse,
    void
  >({
    query: () => ({
      url: "legal-entity",
      method: "GET",
    }),
    providesTags: ["LegalEntity"],
  }),
  getAllLegalEntitiesPaginated: builder.query<
    PaginatedLegalEntitiesResponse,
    {
      page: number;
      limit: number;
      search?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  >({
    query: (params) => ({
      url: "legal-entity/paginated",
      method: "GET",
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search && { search: params.search }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      },
    }),
    providesTags: ["LegalEntity"],
  }),
  getLegalEntity: builder.query<GetLegalEntityResponse, { id: string }>({
    query: (body) => ({
      url: `legal-entity/${body.id}`,
      method: "GET",
    }),
    providesTags: (result, error, arg) => [{ type: "LegalEntity", id: arg.id }],
  }),
  updateLegalEntity: builder.mutation<
    GetLegalEntityResponse,
    { id: string; body: UpdateLegalEntityPayload }
  >({
    query: ({ id, body }) => ({
      url: `legal-entity/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["LegalEntity"],
  }),

  deleteLegalEntity: builder.mutation<any, { id: string }>({
    query: ({ id }) => ({
      url: `legal-entity/${id}`,
      method: "DELETE",
      invalidatesTags: ["LegalEntity"],
    }),
    invalidatesTags: ["LegalEntity"],
  }),
});
