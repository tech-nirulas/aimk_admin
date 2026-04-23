import {
  CreateOutletPayload,
  GetOutletResponse,
  PaginatedOutletsResponse,
  UpdateOutletPayload,
} from "@/interfaces/outlet.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const outletEndpoints = (builder: EndpointDefinitions) => ({
  createOutlet: builder.mutation<GetOutletResponse, CreateOutletPayload>({
    query: (body) => ({
      url: "outlet",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Outlet"],
  }),
  getAllOutlets: builder.query<
    PaginatedOutletsResponse,
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
      url: "outlet",
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
    providesTags: ["Outlet"],
  }),
  getOutlet: builder.query<GetOutletResponse, { id: string }>({
    query: (body) => ({
      url: `outlet/${body.id}`,
      method: "GET",
    }),
    providesTags: (result, error, arg) => [{ type: "Outlet", id: arg.id }],
  }),
  updateOutlet: builder.mutation<
    GetOutletResponse,
    { id: string; body: UpdateOutletPayload }
  >({
    query: ({ id, body }) => ({
      url: `outlet/${id}`,
      method: "PATCH",
      body,
      invalidatesTags: ["Outlet"],
    }),
    invalidatesTags: (result, error, arg) => [{ type: "Outlet", id: arg.id }],
  }),

  deleteOutlet: builder.mutation<any, { id: string }>({
    query: ({ id }) => ({
      url: `outlet/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Outlet"],
  }),
});
