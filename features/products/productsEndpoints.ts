import {
  CreateProductPayload,
  GetProductResponse,
  GetProductsResponse,
  PaginatedProductsResponse,
} from "@/interfaces/product.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const productsEndpoints = (builder: EndpointDefinitions) => ({
  createProduct: builder.mutation<GetProductResponse, CreateProductPayload>({
    query: (body) => ({
      url: "product",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Product"],
  }),
  getAllProducts: builder.query<GetProductsResponse, null>({
    query: () => ({
      url: "product",
      method: "GET",
    }),
    providesTags: ["Product"],
  }),
  getPaginatedProduct: builder.query<
    PaginatedProductsResponse,
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
      url: "product",
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
    providesTags: ["Product"],
  }),
  getProduct: builder.query<GetProductResponse, { id: string }>({
    query: (body) => ({
      url: `product/${body.id}`,
      method: "GET",
    }),
    providesTags: (result, error, arg) => [{ type: "Category", id: arg.id }],
  }),
  updateProduct: builder.mutation<
    GetProductResponse,
    { id: string; body: any }
  >({
    query: ({ id, body }) => ({
      url: `product/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: (result, error, arg) => [{ type: "Category", id: arg.id }],
  }),

  deleteProduct: builder.mutation<any, { id: string }>({
    query: ({ id }) => ({
      url: `product/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Product"],
  }),
});
