import {
  DiscountPayloadBase,
  GetAllDiscountsResponse,
  GetDiscountResponse,
  PaginatedDiscountsResponse,
  UpdateDiscountPayload,
} from "@/interfaces/discount.interface";
import { Root } from "@/interfaces/root.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const discountEndpoints = (builder: EndpointDefinitions) => ({
  createDiscount: builder.mutation<GetDiscountResponse, DiscountPayloadBase>({
    query: (body) => ({
      url: "discount",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Discount"],
  }),
  getAllDiscountsPaginated: builder.query<
    PaginatedDiscountsResponse,
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
      url: "discount/paginated",
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
    providesTags: ["Discount"],
  }),
  getAllDiscounts: builder.query<GetAllDiscountsResponse, void>({
    query: () => ({
      url: "discount",
      method: "GET",
    }),
    providesTags: ["Discount"],
  }),
  getDiscount: builder.query<GetDiscountResponse, { id: string }>({
    query: (body) => ({
      url: `discount/${body.id}`,
      method: "GET",
    }),
    providesTags: ["Discount"],
  }),
  updateDiscount: builder.mutation<
    GetDiscountResponse,
    { id: string; body: UpdateDiscountPayload }
  >({
    query: ({ id, body }) => ({
      url: `discount/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["Discount"],
  }),

  deleteDiscount: builder.mutation<Root<null>, { id: string }>({
    query: ({ id }) => ({
      url: `discount/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Discount"],
  }),
});
