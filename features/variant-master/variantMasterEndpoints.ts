import {
  AssignProductsPayload,
  CreateVariantMasterPayload,
  LinkedProductVariant,
  UpdateVariantMasterPayload,
  UpdateVariantMasterProductPayload,
  VariantCategory,
  VariantMaster,
} from "@/interfaces/variant-master.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const variantMasterEndpoints = (builder: EndpointDefinitions) => ({
  getVariantMasters: builder.query<
    { success: boolean; data: VariantMaster[] },
    { brandId?: string; category?: VariantCategory; search?: string; isActive?: boolean } | void
  >({
    query: (params) => ({
      url: "variant-masters",
      method: "GET",
      params: params || undefined,
    }),
    providesTags: ["VariantMaster"],
  }),

  getVariantMaster: builder.query<
    { success: boolean; data: VariantMaster },
    { id: string }
  >({
    query: ({ id }) => ({
      url: `variant-masters/${id}`,
      method: "GET",
    }),
    providesTags: ["VariantMaster"],
  }),

  createVariantMaster: builder.mutation<
    { success: boolean; data: VariantMaster },
    CreateVariantMasterPayload
  >({
    query: (body) => ({
      url: "variant-masters",
      method: "POST",
      body,
    }),
    invalidatesTags: ["VariantMaster"],
  }),

  updateVariantMaster: builder.mutation<
    { success: boolean; data: VariantMaster },
    { id: string; body: UpdateVariantMasterPayload }
  >({
    query: ({ id, body }) => ({
      url: `variant-masters/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["VariantMaster"],
  }),

  deleteVariantMaster: builder.mutation<{ success: boolean; message: string }, { id: string }>({
    query: ({ id }) => ({
      url: `variant-masters/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["VariantMaster"],
  }),

  getVariantMasterProducts: builder.query<
    { success: boolean; data: LinkedProductVariant[] },
    { id: string }
  >({
    query: ({ id }) => ({
      url: `variant-masters/${id}/products`,
      method: "GET",
    }),
    providesTags: ["VariantMasterProduct"],
  }),

  assignProductsToVariantMaster: builder.mutation<
    { success: boolean; data: any[] },
    { id: string; body: AssignProductsPayload }
  >({
    query: ({ id, body }) => ({
      url: `variant-masters/${id}/assign-products`,
      method: "POST",
      body,
    }),
    invalidatesTags: ["VariantMaster", "VariantMasterProduct", "Product"],
  }),

  updateVariantMasterProduct: builder.mutation<
    { success: boolean; data: any },
    { id: string; productVariantId: string; body: UpdateVariantMasterProductPayload }
  >({
    query: ({ id, productVariantId, body }) => ({
      url: `variant-masters/${id}/products/${productVariantId}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["VariantMasterProduct", "Product"],
  }),

  detachProductFromVariantMaster: builder.mutation<
    { success: boolean; message: string },
    { id: string; productVariantId: string }
  >({
    query: ({ id, productVariantId }) => ({
      url: `variant-masters/${id}/products/${productVariantId}`,
      method: "DELETE",
    }),
    invalidatesTags: ["VariantMaster", "VariantMasterProduct", "Product"],
  }),
});
