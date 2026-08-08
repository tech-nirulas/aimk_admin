import { createApi } from "@reduxjs/toolkit/query/react";
import createBaseQuery from "@/lib/baseQuery";
import { userEndpoints } from "./userEndpoints";

export const userApiService = createApi({
  reducerPath: "userApiService",
  baseQuery: createBaseQuery(),
  tagTypes: ["User", "Role"],
  endpoints: userEndpoints,
});

export const {
  useGetAdminUsersQuery,
  useGetRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useUpdateUserRoleMutation,
  useGetSidebarModulesQuery,
} = userApiService;
