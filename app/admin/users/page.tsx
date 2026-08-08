"use client";

import TableComponent from "@/components/common/DataTable";
import UserForm from "@/components/ui/User/UserForm";
import RoleForm from "@/components/ui/User/RoleForm";
import RolePermissionsModal from "@/components/ui/User/RolePermissionsModal";
import { ProtectedComponent } from "@/components/common/ProtectedComponent";
import { UnauthorizedAccess } from "@/components/common/UnauthorizedAccess";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@aimk/permissions";
import {
  useGetAdminUsersQuery,
  useGetRolesQuery,
  useUpdateUserRoleMutation,
  useDeleteRoleMutation,
} from "@/features/users/userApiService";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import AddIcon from "@mui/icons-material/Add";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyIcon from "@mui/icons-material/Key";
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  debounce,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useToast } from "@/hooks/useToast";
import { FaEdit, FaSearch } from "react-icons/fa";
import { useCallback, useMemo, useState } from "react";

export default function UsersPage() {
  const { openDrawer } = useFormDrawer();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [permissionRole, setPermissionRole] = useState<any>(null);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1);
      }, 500),
    [setSearch, setPage]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (field: string, value: any) => {
    if (field === "isActive") setIsActive(value);
    if (field === "limit") setLimit(value);
    if (field === "sortBy") setSortBy(value);
    if (field === "sortOrder") setSortOrder(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setIsActive("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(10);
    setPage(1);
    debouncedSearch("");
  };

  const { data, isLoading, refetch: handleRefresh } = useGetAdminUsersQuery({
    page,
    limit,
    search: search || undefined,
    isActive: isActive ? isActive === "true" : undefined,
    sortBy,
    sortOrder,
  });

  const { can } = usePermission();
  const canCreateUser = can(PERMISSIONS.USER.CREATE);
  const canUpdateUser = can(PERMISSIONS.USER.UPDATE);
  const canManageRoles = can(PERMISSIONS.USER.MANAGE_ROLES);

  const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useGetRolesQuery({});
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const roles = Array.isArray(rolesData)
    ? rolesData
    : Array.isArray(rolesData?.data)
    ? rolesData.data
    : [];

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
    }
  };

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      await updateUserRole({ id: userId, roleId: newRoleId }).unwrap();
      showSuccess("User role updated successfully!");
      handleRefresh();
    } catch (err: any) {
      showError(err?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete role '${roleName}'?`)) return;
    try {
      await deleteRole(roleId).unwrap();
      showSuccess(`Role '${roleName}' deleted successfully.`);
      refetchRoles();
    } catch (err: any) {
      showError(err?.data?.message || "Failed to delete role");
    }
  };

  const handleCreateNew = useCallback(() => {
    openDrawer({
      drawerName: "Add Team Member",
      children: <UserForm refetch={handleRefresh} />,
      width: 500,
      anchor: "right",
    });
  }, [openDrawer, handleRefresh]);

  const handleEditUser = useCallback(
    (row: any) => {
      openDrawer({
        drawerName: `Edit Team Member (${row.firstName} ${row.lastName})`,
        children: <UserForm initialData={row} refetch={handleRefresh} />,
        width: 500,
        anchor: "right",
      });
    },
    [openDrawer, handleRefresh]
  );

  const handleCreateRole = useCallback(() => {
    openDrawer({
      drawerName: "Create Custom Role",
      children: <RoleForm refetch={refetchRoles} />,
      width: 500,
      anchor: "right",
    });
  }, [openDrawer, refetchRoles]);

  const columns = useMemo(
    () => [
      {
        field: "user",
        headerName: "User",
        flex: 1.5,
        renderCell: ({ row }: any) => (
          <Box className="flex items-center gap-3">
            <Avatar className="bg-primary-600 text-white font-bold">
              {row.firstName?.[0] || row.email?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography variant="body2" className="font-semibold">
                {row.firstName} {row.lastName}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {row.email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: "phone",
        headerName: "Phone",
        flex: 1,
        renderCell: ({ row }: any) => row.phone || "N/A",
      },
      {
        field: "role",
        headerName: "Assigned Role",
        flex: 1.3,
        renderCell: ({ row }: any) => (
          <Box
            sx={{ my: "auto", display: "flex", alignItems: "center" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Select
              size="small"
              value={row.roleId || row.role?.id || ""}
              onChange={(e) => handleRoleChange(row.id, e.target.value as string)}
              disabled={!canManageRoles}
              sx={{ minWidth: 140, height: 32, fontSize: "0.85rem" }}
            >
              {roles.map((r: any) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        ),
      },
      {
        field: "isActive",
        headerName: "Status",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Chip
            label={row.isActive ? "Active" : "Inactive"}
            color={row.isActive ? "success" : "default"}
            size="small"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            {canUpdateUser && (
              <IconButton size="small" color="primary" onClick={() => handleEditUser(row)}>
                <FaEdit />
              </IconButton>
            )}
            {canManageRoles && (
              <IconButton
                size="small"
                color="secondary"
                title="Configure Permissions"
                onClick={() => setPermissionRole(row.role)}
              >
                <KeyIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ),
      },
    ],
    [roles, handleEditUser, canManageRoles, canUpdateUser]
  );

  return (
    <ProtectedComponent permission={PERMISSIONS.USER.READ} fallback={<UnauthorizedAccess />}>
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
          <IconButton onClick={() => { handleRefresh(); refetchRoles(); }}>
            <RefreshIcon />
          </IconButton>
          {canManageRoles && (
            <Button variant="outlined" startIcon={<SecurityIcon />} onClick={handleCreateRole}>
              Create Role
            </Button>
          )}
          {canCreateUser && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
              Add Team Member
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs Header */}
      <Paper sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Team Members" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Roles & Permissions" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab 0: Team Members */}
      {activeTab === 0 && (
        <>
          {/* Filters Section */}
          <Paper className="mb-4 p-4" sx={{ borderRadius: 3 }}>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  fullWidth
                  onChange={handleSearchChange}
                  placeholder="Search by name or email..."
                  slotProps={{
                    input: {
                      startAdornment: <FaSearch className="mr-2 text-gray-400" />,
                    },
                  }}
                />
              </div>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={isActive}
                  label="Status"
                  onChange={(e) => handleFilterChange("isActive", e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Items per page</InputLabel>
                <Select
                  value={limit}
                  label="Items per page"
                  onChange={(e) => handleFilterChange("limit", e.target.value)}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                >
                  <MenuItem value="firstName">Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="createdAt">Created Date</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>

              <Button variant="outlined" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </Paper>

          {/* Table */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <TableComponent
              columns={columns}
              data={data?.data || []}
              currentPage={page}
              setCurrentPage={setPage}
              pageSize={limit}
              totalItems={data?.meta?.totalItems || 0}
              isLoading={isLoading}
              onPageChange={handlePageChange}
            />
          </Paper>

          {/* Pagination Info */}
          {data?.meta && data.meta.totalItems > 0 && (
            <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
              <div>
                Showing {(data.meta.page - 1) * data.meta.limit + 1} to{" "}
                {Math.min(data.meta.page * data.meta.limit, data.meta.totalItems)} of{" "}
                {data.meta.totalItems} entries
              </div>
              <div>
                Page {data.meta.page} of {data.meta.totalPages}
              </div>
            </div>
          )}
        </>
      )}

        {/* TAB 1: ROLES & PERMISSIONS MANAGEMENT */}
        {activeTab === 1 && (
          <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Assigned Users</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rolesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      Loading roles...
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      No roles defined yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <SecurityIcon color="primary" fontSize="small" />
                          {r.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.isSystem ? "System Role" : "Custom Role"}
                          size="small"
                          color={r.isSystem ? "secondary" : "default"}
                          variant={r.isSystem ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {r.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${r._count?.users || 0} users`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<KeyIcon />}
                            onClick={() => setPermissionRole(r)}
                          >
                            Permissions
                          </Button>
                          {!r.isSystem && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRole(r.id, r.name)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        <RolePermissionsModal
          open={Boolean(permissionRole)}
          onClose={() => setPermissionRole(null)}
          role={permissionRole}
        />
      </Box>
    </ProtectedComponent>
  );
}
