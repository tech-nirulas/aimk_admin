"use client";

import {
  useCreateAdminUserMutation,
  useGetRolesQuery,
  useUpdateAdminUserMutation,
} from "@/features/users/userApiService";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { useToast } from "@/hooks/useToast";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

import { User } from "@/interfaces/user.interface";
import { Role } from "@/interfaces/role.interface";

export default function UserForm({
  initialData,
  refetch,
}: {
  initialData?: User | null;
  refetch?: () => void;
}) {
  const { closeDrawer } = useFormDrawer();
  const { showSuccess, showError } = useToast();

  const isEditing = Boolean(initialData?.id);

  const { data: rolesData, isLoading: isRolesLoading } = useGetRolesQuery({});
  const [createAdminUser, { isLoading: isCreating }] = useCreateAdminUserMutation();
  const [updateAdminUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();

  const isLoading = isCreating || isUpdating;

  const roles = Array.isArray(rolesData)
    ? rolesData
    : Array.isArray(rolesData?.data)
    ? rolesData.data
    : [];

  const userSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    password: isEditing
      ? Yup.string().min(6, "Minimum 6 characters").optional()
      : Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
    roleId: Yup.string().required("Role is required"),
  });

  const formik = useFormik({
    initialValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      password: "",
      roleId: initialData?.roleId || initialData?.role?.id || "",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
    enableReinitialize: true,
    validationSchema: userSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing) {
          await updateAdminUser({ id: initialData.id, ...values }).unwrap();
          showSuccess("Team member updated successfully!");
        } else {
          await createAdminUser(values).unwrap();
          showSuccess("Team member added successfully!");
        }
        refetch?.();
        closeDrawer();
      } catch (err: any) {
        showError(err?.data?.message || "Failed to save user");
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            name="firstName"
            label="First Name"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            name="lastName"
            label="Last Name"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            name="email"
            label="Email Address"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            name="phone"
            label="Phone Number"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            name="password"
            label={isEditing ? "New Password (leave blank to keep current)" : "Initial Password"}
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth error={formik.touched.roleId && Boolean(formik.errors.roleId)}>
            <InputLabel id="role-label">Assigned Role</InputLabel>
            <Select
              labelId="role-label"
              name="roleId"
              value={formik.values.roleId}
              label="Assigned Role"
              onChange={formik.handleChange}
              disabled={isRolesLoading}
            >
              {roles.map((r: Role) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} {r.description ? `(${r.description})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {isEditing && (
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isActive}
                  onChange={(e) => formik.setFieldValue("isActive", e.target.checked)}
                />
              }
              label="Active Account"
            />
          </Grid>
        )}

        <Grid size={{ xs: 12 }} sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={closeDrawer}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : isEditing ? "Update Member" : "Create Team Member"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
