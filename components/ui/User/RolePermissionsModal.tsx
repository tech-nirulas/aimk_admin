"use client";

/**
 * Role permission editor.
 *
 * Both sections are derived from `@aimk/permissions` — the sidebar from MODULE_REGISTRY, the
 * action matrix from PERMISSION_MATRIX. There is no local subject/action/module list, so the
 * editor cannot drift from what the sidebar and the API guard actually enforce (principle P1).
 */
import {
  MODULE_REGISTRY,
  PERMISSION_MATRIX,
  WILDCARD_PERMISSION,
} from "@aimk/permissions";
import { useToast } from "@/hooks/useToast";
import { useGetRolePermissionsQuery, useUpdateRolePermissionsMutation } from "@/features/users/userApiService";
import SecurityIcon from "@mui/icons-material/Security";
import NavigationIcon from "@mui/icons-material/Navigation";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { Role } from "@/interfaces/role.interface";

const ALL_PERMISSION_STRINGS = PERMISSION_MATRIX.flatMap((s) =>
  s.actions.map((a) => a.permission as string)
);

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
  const { data: roleData, isLoading } = useGetRolePermissionsQuery(role?.id ?? "", {
    skip: !role?.id || !open,
  });
  const [updatePermissions, { isLoading: isSaving }] = useUpdateRolePermissionsMutation();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wildcard, setWildcard] = useState(false);

  // The server owns resolution (parent-role inheritance included); render what it resolved.
  useEffect(() => {
    const data = (roleData as any)?.data ?? roleData;
    const granted: string[] = Array.isArray(data?.rolePermissionsV2)
      ? data.rolePermissionsV2.map((rp: any) => rp.permission).filter(Boolean)
      : [];
    const isSuperAdmin = role?.name === "super_admin";

    setWildcard(granted.includes(WILDCARD_PERMISSION) || isSuperAdmin);
    setSelected(new Set(granted.filter((p) => p !== WILDCARD_PERMISSION)));
  }, [roleData, role]);

  const grantedCount = wildcard ? ALL_PERMISSION_STRINGS.length : selected.size;

  const toggle = (permission: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  };

  const setSubject = (permissions: string[], on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of permissions) {
        if (on) next.add(p);
        else next.delete(p);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!role) return;
    try {
      const permissions = wildcard ? [WILDCARD_PERMISSION] : Array.from(selected);
      await updatePermissions({ roleId: role.id, permissions }).unwrap();
      showSuccess(
        wildcard
          ? `Full access (*) granted to '${role.name}'`
          : `${permissions.length} permission(s) saved for '${role.name}'`
      );
      onClose();
    } catch (err: any) {
      showError(err?.data?.message || "Failed to update role permissions");
    }
  };

  const apiOnlySubjects = useMemo(
    () => PERMISSION_MATRIX.filter((s) => !s.hasAdminPage),
    []
  );

  const moduleReadPermissions = useMemo(
    () => MODULE_REGISTRY.map((m) => m.requiredPermission as string),
    []
  );

  if (!role) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 800 }}>
        <SecurityIcon color="primary" />
        Configure Permissions — {role.name}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Permissions for the <strong>{role.name}</strong> role. Sidebar visibility is derived from
          each module&apos;s read permission, so the two sections stay consistent automatically.
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={wildcard}
                    onChange={(e) => {
                      setWildcard(e.target.checked);
                      if (e.target.checked) setSelected(new Set());
                    }}
                    color="warning"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Full access (*) — bypasses every individual permission
                  </Typography>
                }
              />
            </Alert>

            {!wildcard && (
              <>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                      <NavigationIcon color="secondary" fontSize="small" />
                      Sidebar Modules
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() =>
                          setSelected((prev) => new Set([...prev, ...moduleReadPermissions]))
                        }
                      >
                        Select All
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="secondary"
                        onClick={() =>
                          setSelected(
                            new Set(
                              Array.from(selected).filter((p) => !moduleReadPermissions.includes(p))
                            )
                          )
                        }
                      >
                        Clear
                      </Button>
                    </Box>
                  </Box>

                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#F8FAFC" }}>
                    <Grid container spacing={1.5}>
                      {MODULE_REGISTRY.map((mod) => {
                        const permission = mod.requiredPermission as string;
                        return (
                          <Grid key={mod.path} size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selected.has(permission)}
                                  onChange={() => toggle(permission)}
                                  size="small"
                                  color="primary"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B" }}>
                                    {mod.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {permission}
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

                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                      <SecurityIcon color="primary" fontSize="small" />
                      Action Permissions
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setSelected(new Set(ALL_PERMISSION_STRINGS))}
                      >
                        Select All
                      </Button>
                      <Button size="small" variant="text" color="secondary" onClick={() => setSelected(new Set())}>
                        Clear
                      </Button>
                    </Box>
                  </Box>

                  {apiOnlySubjects.length > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {apiOnlySubjects.map((s) => s.label).join(", ")} gate API behaviour but have
                      no sidebar page of their own.
                    </Alert>
                  )}

                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Resource</TableCell>
                          {PERMISSION_MATRIX[0].actions.map((a) => (
                            <TableCell key={a.key} align="center" sx={{ fontWeight: 800 }}>
                              {a.label}
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={{ fontWeight: 800 }}>
                            All
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {PERMISSION_MATRIX.map((subject) => {
                          const perms = subject.actions.map((a) => a.permission as string);
                          const allOn = perms.every((p) => selected.has(p));
                          return (
                            <TableRow key={subject.key} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {subject.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {subject.key}
                                </Typography>
                              </TableCell>
                              {subject.actions.map((action) => (
                                <TableCell key={action.key} align="center">
                                  <Checkbox
                                    checked={selected.has(action.permission as string)}
                                    onChange={() => toggle(action.permission as string)}
                                    size="small"
                                    color="primary"
                                  />
                                </TableCell>
                              ))}
                              <TableCell align="center">
                                <Tooltip title="Toggle every action for this resource">
                                  <Checkbox
                                    checked={allOn}
                                    indeterminate={!allOn && perms.some((p) => selected.has(p))}
                                    onChange={() => setSubject(perms, !allOn)}
                                    size="small"
                                    color="secondary"
                                  />
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>

                  <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      size="small"
                      label={`${grantedCount} permission(s) selected`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </>
            )}
          </>
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
