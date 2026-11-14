"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Form, Formik } from "formik";
import * as Yup from "yup";
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
  Typography,
} from "@mui/material";

import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import {
  useCreateVariantMasterMutation,
  useUpdateVariantMasterMutation,
} from "@/features/variant-master/variantMasterApiService";
import { CreateVariantMasterPayload, VariantCategory } from "@/interfaces/variant-master.interface";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Variant Name is required (e.g. 500g, 1kg)"),
  code: Yup.string()
    .required("Unique Code is required (e.g. SIZE_500G)")
    .matches(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric with underscores or dashes"),
  category: Yup.string().required("Category is required"),
  defaultWeight: Yup.number().nullable().min(0, "Weight must be positive"),
  defaultWeightUnit: Yup.string().nullable(),
});

export default function VariantMasterForm() {
  const { isEditing, closeDrawer } = useFormDrawer();
  const { showToast } = useToast();

  const selectedMaster = useSelector(
    (state: any) => state.variantMasterReducer?.selectedMaster
  );

  const { data: brandsData } = useGetAllBrandsQuery();

  const [
    createMaster,
    {
      isLoading: isCreateLoading,
      isSuccess: isCreateSuccess,
      isError: isCreateError,
      error: createError,
    },
  ] = useCreateVariantMasterMutation();

  const [
    updateMaster,
    {
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateVariantMasterMutation();

  const initialValues: CreateVariantMasterPayload = {
    name: selectedMaster?.name || "",
    code: selectedMaster?.code || "",
    category: (selectedMaster?.category as VariantCategory) || "WEIGHT",
    defaultWeight: selectedMaster?.defaultWeight ?? null,
    defaultWeightUnit: selectedMaster?.defaultWeightUnit || "g",
    description: selectedMaster?.description || "",
    displayOrder: selectedMaster?.displayOrder ?? 0,
    isActive: selectedMaster?.isActive !== undefined ? selectedMaster.isActive : true,
    brandId: selectedMaster?.brandId || "",
  };

  const handleSubmit = async (values: CreateVariantMasterPayload) => {
    try {
      const payload: CreateVariantMasterPayload = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        category: values.category,
        defaultWeight: values.defaultWeight !== null && values.defaultWeight !== undefined && values.defaultWeight !== ("" as any)
          ? Number(values.defaultWeight)
          : null,
        defaultWeightUnit: values.defaultWeightUnit ? values.defaultWeightUnit.trim() : "g",
        description: values.description ? values.description.trim() : undefined,
        displayOrder: Number(values.displayOrder || 0),
        isActive: Boolean(values.isActive),
        brandId: values.brandId ? values.brandId : null,
      };

      if (isEditing && selectedMaster?.id) {
        await updateMaster({
          id: selectedMaster.id,
          body: payload,
        }).unwrap();
      } else {
        await createMaster(payload).unwrap();
      }
    } catch (err: any) {
      console.error("Failed to save variant master:", err);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Variant Master created successfully!", "success");
      closeDrawer();
    }
    if (isUpdateSuccess) {
      showToast("Variant Master updated successfully!", "success");
      closeDrawer();
    }
    if (isCreateError) {
      showToast((createError as any)?.data?.message || "Failed to create variant master", "error");
    }
    if (isUpdateError) {
      showToast((updateError as any)?.data?.message || "Failed to update variant master", "error");
    }
  }, [isCreateSuccess, isUpdateSuccess, isCreateError, isUpdateError, createError, updateError, showToast, closeDrawer]);

  const isLoading = isCreateLoading || isUpdateLoading;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
        <Form className="p-4 flex flex-col gap-4">
          <Typography variant="body2" color="text.secondary">
            Variant masters define standard reusable portion sizes (e.g. 500g, 1kg, 2kg, Single Scoop). Once created, you can link this variant directly to multiple products.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                name="name"
                label="Variant Name *"
                placeholder="e.g. 500g (Half Kg), 1kg, Regular"
                value={values.name}
                onChange={(e) => {
                  handleChange(e);
                  if (!isEditing && !values.code) {
                    const generatedCode = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "_")
                      .replace(/_+/g, "_");
                    setFieldValue("code", `SIZE_${generatedCode}`);
                  }
                }}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                name="code"
                label="Unique Code *"
                placeholder="e.g. SIZE_500G, SIZE_1KG"
                value={values.code}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.code && Boolean(errors.code)}
                helperText={touched.code && errors.code}
                disabled={isEditing}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category *</InputLabel>
                <Select
                  name="category"
                  value={values.category}
                  label="Category *"
                  onChange={handleChange}
                >
                  <MenuItem value="WEIGHT">Weight / Mass (e.g. 500g, 1kg)</MenuItem>
                  <MenuItem value="PORTION">Portion / Size (e.g. Regular, Large)</MenuItem>
                  <MenuItem value="PACK_SIZE">Pack Size (e.g. Box of 4, Box of 6)</MenuItem>
                  <MenuItem value="SCOOP">Scoop (e.g. Single Scoop, Double Scoop)</MenuItem>
                  <MenuItem value="VOLUME">Volume (e.g. 500ml, 1 Litre)</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Brand Scope (Optional)</InputLabel>
                <Select
                  name="brandId"
                  value={values.brandId || ""}
                  label="Brand Scope (Optional)"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>All Brands (Global)</em>
                  </MenuItem>
                  {brandsData?.data?.map((b: any) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="defaultWeight"
                label="Default Measure"
                placeholder="e.g. 500, 1"
                value={values.defaultWeight ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.defaultWeight && Boolean(errors.defaultWeight)}
                helperText={touched.defaultWeight && errors.defaultWeight}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Unit</InputLabel>
                <Select
                  name="defaultWeightUnit"
                  value={values.defaultWeightUnit || "g"}
                  label="Unit"
                  onChange={handleChange}
                >
                  <MenuItem value="g">grams (g)</MenuItem>
                  <MenuItem value="kg">kilograms (kg)</MenuItem>
                  <MenuItem value="ml">millilitres (ml)</MenuItem>
                  <MenuItem value="l">litres (l)</MenuItem>
                  <MenuItem value="pcs">pieces (pcs)</MenuItem>
                  <MenuItem value="box">box</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="displayOrder"
                label="Sort Order"
                value={values.displayOrder}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }} className="flex items-center">
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(values.isActive)}
                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                  />
                }
                label={<Typography variant="body2">Active</Typography>}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                name="description"
                label="Description (Optional)"
                placeholder="Optional notes or portion details for this variant..."
                value={values.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={closeDrawer} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {isEditing ? "Update Master" : "Create Master"}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
}
