import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const orderEndpoints = (builder: EndpointDefinitions) => ({
  createOrder: builder.mutation<
    any,
    {
      orderType: string;
      deliveryAddressId: string;
      promoCode?: string;
    }
  >({
    query: (body) => ({
      url: "order",
      method: "POST",
      body,
    }),
  }),

  verifyPayment: builder.mutation<
    any,
    {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  >({
    query: (body) => ({
      url: "order/verify-payment",
      method: "POST",
      body,
    }),
  }),

  getOrders: builder.query<any, void>({
    query: () => ({
      url: "order",
      method: "GET",
    }),
    providesTags: ["Order"],
  }),

  getOrdersPaginated: builder.query<
    any,
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
      url: "order/paginated",
      method: "GET",
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      },
    }),
    providesTags: ["Order"],
  }),

  getOrder: builder.query<any, { id: string }>({
    query: ({ id }) => ({
      url: `order/${id}`,
      method: "GET",
    }),
    providesTags: ["Order"],
  }),

  getAllAdminOrders: builder.query<
    any,
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
      url: "order/admin/all",
      method: "GET",
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      },
    }),
    providesTags: ["Order"],
  }),

  updateOrderStatus: builder.mutation<any, { id: string; status: string }>({
    query: ({ id, status }) => ({
      url: `order/admin/${id}/status`,
      method: "PATCH",
      body: { status },
    }),
    invalidatesTags: ["Order"],
  }),
});
