import {
  CreateBrandPayload,
  GetAllBrandsPaginatedResponse,
  GetAllBrandsResponse,
  GetBrandResponse,
  UpdateBrandPayload,
} from "@/interfaces/brand.interface";
import { CreateCategoryPayload } from "@/interfaces/category.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const brandEndpoints = (builder: EndpointDefinitions) => ({
  createBrand: builder.mutation<GetBrandResponse, CreateBrandPayload>({
    query: (body) => ({
      url: "brands",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Brand"],
  }),
  getAllBrandsPaginated: builder.query<
    GetAllBrandsPaginatedResponse,
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
      url: "brands/paginated",
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
    providesTags: ["Brand"],
  }),
  getAllBrands: builder.query<GetAllBrandsResponse, void>({
    query: () => ({
      url: "brands",
      method: "GET",
    }),
    providesTags: ["Brand"],
  }),
  getBrand: builder.query<GetBrandResponse, { id: string }>({
    query: (body) => ({
      url: `brands/${body.id}`,
      method: "GET",
    }),
    providesTags: ["Brand"],
  }),
  updateBrand: builder.mutation<
    GetBrandResponse,
    { id: string; body: UpdateBrandPayload }
  >({
    query: ({ id, body }) => ({
      url: `brands/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["Brand"],
  }),

  deleteBrand: builder.mutation<any, { id: string }>({
    query: ({ id }) => ({
      url: `brands/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Brand"],
  }),
});
