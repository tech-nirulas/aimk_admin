import {
  CreateCategoryPayload,
  GetCategoryResponse,
  PaginatedCategoriesResponse
} from "@/interfaces/category.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const categoryEndpoints = (builder: EndpointDefinitions) => ({
  createCategory: builder.mutation<GetCategoryResponse, CreateCategoryPayload>({
    query: (body) => ({
      url: "category",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Category"],
  }),
  getAllCategories: builder.query<
    PaginatedCategoriesResponse,
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
      url: "category",
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
    providesTags: ["Category"],
  }),
  getCategory: builder.query<GetCategoryResponse, { id: string }>({
    query: (body) => ({
      url: `category/${body.id}`,
      method: "GET",
    }),
    providesTags: (result, error, arg) => [{ type: "Category", id: arg.id }],
  }),
  updateCategory: builder.mutation<any, { id: string; body: any }>({
    query: ({ id, body }) => ({
      url: `category/${id}`,
      method: "PATCH",
      body,
      invalidatesTags: ["Category"],
    }),
    invalidatesTags: (result, error, arg) => [{ type: "Category", id: arg.id }],
  }),

  deleteCategory: builder.mutation<any, { id: string }>({
    query: ({ id }) => ({
      url: `category/${id}`,
      method: "DELETE",
      invalidatesTags: ["Category"],
    }),
    invalidatesTags: ["Category"],
  }),

  getCategoriesWithSkuCount: builder.query<any, void>({
    query: () => ({
      url: `category/categories-with-count`,
      method: "GET",
    }),
    providesTags: ["Category"],
  }),
});
