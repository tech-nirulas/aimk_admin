"use client";

import TableComponent from "@/components/common/DataTable";
import UserForm from "@/components/ui/User/UserForm";
import RoleForm from "@/components/ui/User/RoleForm";
import {
  useGetAdminUsersQuery,
  useGetRolesQuery,
  useUpdateUserRoleMutation,
} from "@/features/users/userApiService";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import AddIcon from "@mui/icons-material/Add";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { useToast } from "@/hooks/useToast";
import { FaEdit } from "react-icons/fa";
import { useCallback, useMemo, useState } from "react";

import RolePermissionsModal from "@/components/ui/User/RolePermissionsModal";
import KeyIcon from "@mui/icons-material/Key";

export default function UsersPage() {
  const { openDrawer } = useFormDrawer();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [permissionRole, setPermissionRole] = useState<any>(null);

  const { data, isLoading, refetch: handleRefresh } = useGetAdminUsersQuery({ page, limit });
  const { data: rolesData, refetch: refetchRoles } = useGetRolesQuery({});
  const [updateUserRole] = useUpdateUserRoleMutation();

  const roles = Array.isArray(rolesData)
    ? rolesData
    : Array.isArray(rolesData?.data)
    ? rolesData.data
    : [];

  const handleCreateNew = useCallback(() => {
    openDrawer({
      drawerName: "Add New Team Member",
      children: <UserForm refetch={handleRefresh} />,
      width: 550,
      anchor: "right",
    });
  }, [openDrawer, handleRefresh]);

  const handleCreateRole = useCallback(() => {
    openDrawer({
      drawerName: "Create Custom Role",
      children: <RoleForm refetch={refetchRoles} />,
      width: 500,
      anchor: "right",
    });
  }, [openDrawer, refetchRoles]);

  const handleEdit = useCallback(
    (row: any) => {
      openDrawer({
        drawerName: "Edit Team Member",
        children: <UserForm initialData={row} refetch={handleRefresh} />,
        width: 550,
        anchor: "right",
      });
    },
    [openDrawer, handleRefresh]
  );

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      await updateUserRole({ id: userId, roleId: newRoleId }).unwrap();
      showSuccess("User role updated!");
      handleRefresh();
    } catch (err: any) {
      showError(err?.data?.message || "Failed to update role");
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "User",
        flex: 1.5,
        renderCell: ({ row }: any) => {
          const name = `${row.firstName || ""} ${row.lastName || ""}`.trim() || "User";
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
              <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700, width: 36, height: 36 }}>
                {name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                  {name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {row.email}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        field: "phone",
        headerName: "Phone",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ color: "#334155" }}>
            {row.phone || "N/A"}
          </Typography>
        ),
      },
      {
        field: "role",
        headerName: "Role & Permissions",
        flex: 1.8,
        renderCell: ({ row }: any) => {
          const selectedValue = row.roleId || row.role?.id || "";
          const assignedRole = roles.find((r: any) => r.id === selectedValue) || row.role;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: "auto" }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={selectedValue}
                  onChange={(e) => handleRoleChange(row.id, e.target.value)}
                  sx={{ borderRadius: 2, fontSize: "0.8rem", height: 32 }}
                >
                  {roles?.map((r: any) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {assignedRole && (
                <IconButton
                  size="small"
                  title={`Configure ${assignedRole.name} permissions`}
                  onClick={() => setPermissionRole(assignedRole)}
                  sx={{ color: "primary.main" }}
                >
                  <KeyIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Chip
            label={row.isActive ? "Active" : "Inactive"}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: row.isActive ? "#DCFCE7" : "#FEE2E2",
              color: row.isActive ? "#15803D" : "#991B1B",
            }}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.6,
        renderCell: ({ row }: any) => (
          <Box className="flex gap-3 items-center justify-start h-full">
            <FaEdit
              className="cursor-pointer text-blue-600 hover:text-blue-800"
              size={18}
              onClick={() => handleEdit(row)}
            />
          </Box>
        ),
      },
    ],
    [roles, handleEdit]
  );

  return (
    <Box className="p-6">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PeopleIcon sx={{ color: "primary.main", fontSize: "2rem" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Team Users & Roles (RBAC)
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Manage team accounts, assign roles, and control access permissions
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          <Button variant="outlined" startIcon={<SecurityIcon />} onClick={handleCreateRole}>
            Create Role
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
            Add Team Member
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TableComponent
          columns={columns}
          data={data?.data || []}
          currentPage={page}
          setCurrentPage={setPage}
          pageSize={limit}
          totalItems={data?.meta?.totalItems || 0}
          isLoading={isLoading}
        />
      </Paper>

      <RolePermissionsModal
        open={Boolean(permissionRole)}
        onClose={() => setPermissionRole(null)}
        role={permissionRole}
      />
    </Box>
  );
}
