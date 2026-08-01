"use client";

import {
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from "@/features/users/userApiService";
import { useToast } from "@/hooks/useToast";
import SecurityIcon from "@mui/icons-material/Security";
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const SUBJECTS = [
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

  const [updatePermissions, { isLoading: isSaving }] = useUpdateRolePermissionsMutation();

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (roleData?.permissions) {
      const permMap: Record<string, boolean> = {};
      roleData.permissions.forEach((p: Permission) => {
        const key = `${p.action}:${p.subject || (p as any).module}`;
        permMap[key] = true;
      });
      setSelectedPermissions(permMap);
    }
  }, [roleData]);

  const handleToggle = (action: string, subject: string) => {
    const key = `${action}:${subject}`;
    setSelectedPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      const permissions = Object.entries(selectedPermissions)
        .filter(([, active]) => active)
        .map(([key]) => {
          const [action, subject] = key.split(":");
          return { action, subject };
        });

      await updatePermissions({ roleId: role.id, permissions }).unwrap();
      showSuccess(`Permissions updated for role ${role.name}`);
      onClose();
    } catch (err: any) {
      showError(err?.data?.message || "Failed to update permissions");
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 800 }}>
        <SecurityIcon color="primary" />
        Configure Permissions — {role.name}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control what actions users assigned to the <strong>{role.name}</strong> role can perform across admin modules.
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Module / Panel</TableCell>
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
                            onChange={() => handleToggle(act, sub.key)}
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
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={20} /> : "Save Permissions"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
