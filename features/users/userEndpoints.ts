import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

export const userEndpoints = (builder: EndpointBuilder<any, any, any>) => ({
  getAdminUsers: builder.query({
    query: (params: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => ({
      url: `/user/admin/list`,
      method: "GET",
      params,
    }),
    providesTags: ["User"],
  }),
  getRoles: builder.query({
    query: () => ({
      url: `/user/roles`,
      method: "GET",
    }),
    providesTags: ["Role"],
  }),
  createRole: builder.mutation({
    query: (body: { name: string; description?: string }) => ({
      url: `/user/roles`,
      method: "POST",
      body,
    }),
    invalidatesTags: ["Role"],
  }),
  deleteRole: builder.mutation({
    query: (id: string) => ({
      url: `/user/roles/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Role"],
  }),
  getRolePermissions: builder.query({
    query: (roleId: string) => ({
      url: `/user/roles/${roleId}/permissions`,
      method: "GET",
    }),
    providesTags: ["Role"],
  }),
  updateRolePermissions: builder.mutation({
    query: ({
      roleId,
      permissions,
      moduleIds,
      modulePaths,
    }: {
      roleId: string;
      permissions?: any[];
      moduleIds?: string[];
      modulePaths?: string[];
    }) => ({
      url: `/user/roles/${roleId}/permissions`,
      method: "PATCH",
      body: { permissions, moduleIds, modulePaths },
    }),
    invalidatesTags: ["Role"],
  }),
  getSidebarModules: builder.query({
    query: () => ({
      url: `/user/modules`,
      method: "GET",
    }),
  }),
  createAdminUser: builder.mutation({
    query: (body: any) => ({
      url: `/user/admin/create`,
      method: "POST",
      body,
    }),
    invalidatesTags: ["User"],
  }),
  updateAdminUser: builder.mutation({
    query: ({ id, ...body }: any) => ({
      url: `/user/admin/${id}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["User"],
  }),
  updateUserRole: builder.mutation({
    query: ({ id, roleId }: { id: string; roleId: string }) => ({
      url: `/user/admin/${id}/role`,
      method: "PATCH",
      body: { roleId },
    }),
    invalidatesTags: ["User"],
  }),
});
