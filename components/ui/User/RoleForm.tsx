"use client";

import { useCreateRoleMutation } from "@/features/users/userApiService";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { useToast } from "@/hooks/useToast";
import { Box, Button, CircularProgress, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const roleSchema = Yup.object({
  name: Yup.string().required("Role name is required"),
  description: Yup.string().optional(),
});

export default function RoleForm({ refetch }: { refetch?: () => void }) {
  const { closeDrawer } = useFormDrawer();
  const { showSuccess, showError } = useToast();

  const [createRole, { isLoading }] = useCreateRoleMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: roleSchema,
    onSubmit: async (values) => {
      try {
        await createRole(values).unwrap();
        showSuccess("New role created successfully!");
        refetch?.();
        closeDrawer();
      } catch (err: any) {
        showError(err?.data?.message || "Failed to create role");
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            name="name"
            label="Role Name (e.g. BAKERY_MANAGER)"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            name="description"
            label="Role Description"
            value={formik.values.description}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={closeDrawer}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Create Role"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
