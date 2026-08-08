"use client";

import {
  useGetRolePermissionsQuery,
  useGetSidebarModulesQuery,
  useUpdateRolePermissionsMutation,
} from "@/features/users/userApiService";
import { useToast } from "@/hooks/useToast";
import SecurityIcon from "@mui/icons-material/Security";
import NavigationIcon from "@mui/icons-material/Navigation";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const SYSTEM_MODULES = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/products", label: "Products Catalog" },
  { path: "/admin/inventory", label: "Inventory & Batches" },
  { path: "/admin/customers", label: "Customers Management" },
  { path: "/admin/categories", label: "Product Categories" },
  { path: "/admin/cake-customizations", label: "Cake Customizations" },
  { path: "/admin/reviews", label: "Customer Reviews" },
  { path: "/admin/users", label: "Team Users & Roles" },
  { path: "/admin/media", label: "Media Library" },
  { path: "/admin/outlets", label: "Bakery Outlets" },
  { path: "/admin/brands", label: "Brands Management" },
  { path: "/admin/legal-entities", label: "Legal Entities" },
  { path: "/admin/outlet-prices", label: "Outlet Prices" },
  { path: "/admin/orders", label: "Orders Management" },
  { path: "/admin/payments", label: "Payments & Refunds" },
  { path: "/admin/discounts", label: "Discounts Engine" },
  { path: "/admin/offers", label: "Offers & Coupons" },
];

const SUBJECTS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "product", label: "Products Catalog" },
  { key: "order", label: "Customer Orders" },
  { key: "category", label: "Categories" },
  { key: "discount", label: "Discounts & Promos" },
  { key: "offer", label: "Offer Banners" },
  { key: "media", label: "Media Library" },
  { key: "outlet", label: "Outlets & Locations" },
  { key: "user", label: "Team Users & Roles" },
];

const ACTIONS = ["read", "create", "update", "delete"];

import { Role } from "@/interfaces/role.interface";
import { Permission } from "@/interfaces/permission.interface";

export default function RolePermissionsModal({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}) {
  const { showSuccess, showError } = useToast();

  const { data: roleData, isLoading } = useGetRolePermissionsQuery(role?.id, {
    skip: !role?.id || !open,
  });

  const { data: modulesData } = useGetSidebarModulesQuery(undefined, { skip: !open });

  const [updatePermissions, { isLoading: isSaving }] = useUpdateRolePermissionsMutation();

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [selectedModulePaths, setSelectedModulePaths] = useState<string[]>([]);

  const rawModules = (modulesData as any)?.data || modulesData;
  const availableModules = Array.isArray(rawModules) && rawModules.length > 0 ? rawModules : SYSTEM_MODULES;

  useEffect(() => {
    const actualData = (roleData as any)?.data || roleData;
    if (actualData) {
      const isSuperAdmin = role?.name === 'super_admin';
      const permMap: Record<string, boolean> = {};

      if (
        isSuperAdmin ||
        (actualData.rolePermissionsV2 && actualData.rolePermissionsV2.some((rp: any) => rp.permission === '*'))
      ) {
        SUBJECTS.forEach((sub) => {
          ACTIONS.forEach((act) => {
            permMap[`${act}:${sub.key}`] = true;
          });
        });
        permMap['*'] = true;
      } else if (actualData.rolePermissionsV2 && Array.isArray(actualData.rolePermissionsV2) && actualData.rolePermissionsV2.length > 0) {
        actualData.rolePermissionsV2.forEach((rp: any) => {
          if (rp.permission && rp.permission.includes(':')) {
            const [subject, action] = rp.permission.split(':');
            permMap[`${action}:${subject}`] = true;
          }
        });
      } else if (actualData.permissions && Array.isArray(actualData.permissions)) {
        actualData.permissions.forEach((p: Permission) => {
          const key = `${p.action}:${p.subject || (p as any).module}`;
          permMap[key] = true;
        });
      }
      setSelectedPermissions(permMap);

      // 2. Role Modules
      if (isSuperAdmin) {
        const allPaths = availableModules.map((m: any) => m.path);
        setSelectedModulePaths(allPaths);
      } else if (actualData.roleModules && Array.isArray(actualData.roleModules)) {
        const paths = actualData.roleModules
          .filter((rm: any) => rm.canView || rm.canAccess)
          .map((rm: any) => rm.module?.path)
          .filter(Boolean);
        setSelectedModulePaths(paths);
      }
    }
  }, [roleData, modulesData, role]);

  const handleTogglePermission = (action: string, subject: string) => {
    const key = `${action}:${subject}`;
    setSelectedPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleModulePath = (path: string) => {
    setSelectedModulePaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const handleSelectAllModules = () => {
    const allPaths = availableModules.map((m: any) => m.path);
    setSelectedModulePaths(allPaths);
  };

  const handleDeselectAllModules = () => {
    setSelectedModulePaths(["/admin"]);
  };

  const handleSelectAllPermissions = () => {
    const allPerms: Record<string, boolean> = {};
    SUBJECTS.forEach((sub) => {
      ACTIONS.forEach((act) => {
        allPerms[`${act}:${sub.key}`] = true;
      });
    });
    setSelectedPermissions((prev) => ({ ...prev, ...allPerms }));
  };

  const handleDeselectAllPermissions = () => {
    const cleared: Record<string, boolean> = {};
    SUBJECTS.forEach((sub) => {
      ACTIONS.forEach((act) => {
        cleared[`${act}:${sub.key}`] = false;
      });
    });
    setSelectedPermissions((prev) => ({ ...prev, ...cleared }));
  };

  const handleSave = async () => {
    if (!role) return;
    try {
      const permissions: string[] = Object.entries(selectedPermissions)
        .filter(([, active]) => active)
        .map(([key]) => {
          if (key === '*') return '*';
          const [action, subject] = key.split(":");
          return `${subject}:${action}`;
        });

      await updatePermissions({
        roleId: role.id,
        permissions,
        modulePaths: selectedModulePaths,
      }).unwrap();

      showSuccess(`Permissions & sidebar access updated for role '${role.name}'`);
      onClose();
    } catch (err: any) {
      showError(err?.data?.message || "Failed to update role permissions");
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 800 }}>
        <SecurityIcon color="primary" />
        Configure Permissions & Access — {role.name}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure allowed sidebar routes and action permissions for users assigned to the <strong>{role.name}</strong> role.
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Section 1: Sidebar Navigation & Route Access */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                  <NavigationIcon color="secondary" fontSize="small" />
                  Sidebar Navigation & Route Access
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" variant="text" onClick={handleSelectAllModules}>
                    Select All
                  </Button>
                  <Button size="small" variant="text" color="secondary" onClick={handleDeselectAllModules}>
                    Clear
                  </Button>
                </Box>
              </Box>

              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#F8FAFC" }}>
                <Grid container spacing={1.5}>
                  {availableModules.map((mod: any) => {
                    const isChecked = selectedModulePaths.includes(mod.path);
                    return (
                      <Grid key={mod.path} size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleToggleModulePath(mod.path)}
                              size="small"
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B" }}>
                                {mod.name || mod.label}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {mod.path}
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Section 2: Action Permissions Matrix */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                  <SecurityIcon color="primary" fontSize="small" />
                  Action Permissions Matrix (CRUD)
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" variant="text" onClick={handleSelectAllPermissions}>
                    Select All
                  </Button>
                  <Button size="small" variant="text" color="secondary" onClick={handleDeselectAllPermissions}>
                    Clear
                  </Button>
                </Box>
              </Box>
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Module / Resource</TableCell>
                      {ACTIONS.map((act) => (
                        <TableCell key={act} align="center" sx={{ fontWeight: 800, textTransform: "capitalize" }}>
                          {act}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {SUBJECTS.map((sub) => (
                      <TableRow key={sub.key} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{sub.label}</TableCell>
                        {ACTIONS.map((act) => {
                          const key = `${act}:${sub.key}`;
                          const isChecked = Boolean(selectedPermissions[key]);
                          return (
                            <TableCell key={act} align="center">
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleTogglePermission(act, sub.key)}
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={20} /> : "Save Permissions & Access"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
