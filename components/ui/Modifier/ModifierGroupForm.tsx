"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Form, Formik, FieldArray } from "formik";
import * as Yup from "yup";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import {
  useCreateModifierMutation,
  useUpdateModifierMutation,
} from "@/features/modifiers/modifierApiService";
import {
  CreateModifierGroupPayload,
  DietaryStatus,
} from "@/interfaces/modifier.interface";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Internal Name is required"),
  displayName: Yup.string().required("Display Title is required"),
  minSelections: Yup.number().min(0, "Min selections must be >= 0").required(),
  maxSelections: Yup.number()
    .min(1, "Max selections must be at least 1")
    .test(
      "max-gte-min",
      "Max selections must be greater than or equal to min selections",
      function (value) {
        const { minSelections } = this.parent;
        return value !== undefined && minSelections !== undefined
          ? value >= minSelections
          : true;
      }
    )
    .required(),
  options: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Option name is required"),
        price: Yup.number().min(0, "Price must be >= 0").required("Price is required"),
      })
    )
    .min(1, "At least one option is required"),
});

export default function ModifierGroupForm() {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();
  const theme = useTheme();

  const selectedModifier = useSelector(
    (state: any) => state.modifierReducer?.selectedModifier
  );

  const { data: brandsData } = useGetAllBrandsQuery();

  const [
    createModifier,
    {
      isLoading: isCreateLoading,
      isSuccess: isCreateSuccess,
      isError: isCreateError,
      error: createError,
    },
  ] = useCreateModifierMutation();

  const [
    updateModifier,
    {
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateModifierMutation();

  const initialValues: CreateModifierGroupPayload = {
    name: selectedModifier?.name || "",
    displayName: selectedModifier?.displayName || "",
    brandId: selectedModifier?.brandId || "",
    minSelections: selectedModifier?.minSelections ?? 0,
    maxSelections: selectedModifier?.maxSelections ?? 1,
    isRequired: selectedModifier?.isRequired ?? false,
    options: selectedModifier?.options?.length
      ? selectedModifier.options.map((opt: any, idx: number) => ({
          id: opt.id,
          name: opt.name,
          price: Number(opt.price || 0),
          isDefault: Boolean(opt.isDefault),
          inStock: opt.inStock !== undefined ? Boolean(opt.inStock) : true,
          dietaryStatus: (opt.dietaryStatus as DietaryStatus) || "VEG",
          displayOrder: opt.displayOrder ?? idx,
        }))
      : [
          {
            name: "",
            price: 0,
            isDefault: false,
            inStock: true,
            dietaryStatus: "VEG" as DietaryStatus,
            displayOrder: 0,
          },
        ],
  };

  const handleSubmit = async (values: CreateModifierGroupPayload) => {
    try {
      const payload = {
        name: values.name.trim(),
        displayName: values.displayName.trim(),
        brandId: values.brandId ? values.brandId : null,
        minSelections: Number(values.minSelections),
        maxSelections: Number(values.maxSelections),
        isRequired: Number(values.minSelections) > 0 || Boolean(values.isRequired),
        options: values.options.map((opt, idx) => ({
          ...(opt.id ? { id: opt.id } : {}),
          name: opt.name.trim(),
          price: Number(opt.price || 0),
          isDefault: Boolean(opt.isDefault),
          inStock: opt.inStock !== false,
          dietaryStatus: opt.dietaryStatus || "VEG",
          displayOrder: opt.displayOrder ?? idx,
        })),
      };

      if (isEditing && selectedModifier?.id) {
        await updateModifier({
          id: selectedModifier.id,
          body: payload,
        }).unwrap();
      } else {
        await createModifier(payload).unwrap();
      }
    } catch (err: any) {
      console.error("Failed to save modifier group:", err);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Modifier Group created successfully!", "success");
      closeDrawer();
    }
    if (isUpdateSuccess) {
      showToast("Modifier Group updated successfully!", "success");
      closeDrawer();
    }
    if (isCreateError) {
      showToast((createError as any)?.data?.message || "Failed to create modifier group", "error");
    }
    if (isUpdateError) {
      showToast((updateError as any)?.data?.message || "Failed to update modifier group", "error");
    }
  }, [isCreateSuccess, isUpdateSuccess, isCreateError, isUpdateError, createError, updateError]);

  const isLoading = isCreateLoading || isUpdateLoading;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        submitForm,
      }) => (
        <Form style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* ── Scrollable Body ────────────────────────────────────────── */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Modifier groups are reusable add-on sets (e.g. &quot;Select Free Toppings&quot;, &quot;Extra Dips&quot;, or &quot;Eggless Option&quot;) that can be attached to any product.
                </Alert>
              </Grid>

              {/* Internal Name */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="name"
                  label="Internal Name *"
                  fullWidth
                  size="small"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  placeholder="e.g. Celebration Cake Modifiers"
                />
              </Grid>

              {/* Display Title */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="displayName"
                  label="Customer Display Title *"
                  fullWidth
                  size="small"
                  value={values.displayName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.displayName && Boolean(errors.displayName)}
                  helperText={
                    (touched.displayName && errors.displayName) ||
                    "Shown to customer in the customization bottom sheet / modal"
                  }
                  placeholder="e.g. Choose Free Message Tag / Add-ons"
                />
              </Grid>

              {/* Brand Selector */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand (Optional)</InputLabel>
                  <Select
                    name="brandId"
                    value={values.brandId || ""}
                    label="Brand (Optional)"
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

              {/* Selection Constraints */}
              <Grid size={{ xs: 6 }}>
                <TextField
                  name="minSelections"
                  label="Min Selections *"
                  type="number"
                  fullWidth
                  size="small"
                  value={values.minSelections}
                  onChange={(e) => {
                    const min = Number(e.target.value);
                    handleChange(e);
                    if (min > 0) {
                      setFieldValue("isRequired", true);
                    }
                  }}
                  onBlur={handleBlur}
                  error={touched.minSelections && Boolean(errors.minSelections)}
                  helperText="0 = Optional, 1+ = Required"
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  name="maxSelections"
                  label="Max Selections *"
                  type="number"
                  fullWidth
                  size="small"
                  value={values.maxSelections}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.maxSelections && Boolean(errors.maxSelections)}
                  helperText="1 = Single Choice, >1 = Multiple"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(values.isRequired || values.minSelections > 0)}
                      disabled={values.minSelections > 0}
                      onChange={(e) => setFieldValue("isRequired", e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Required Selection (Customer must choose at least {Math.max(1, values.minSelections)} option)
                    </Typography>
                  }
                />
              </Grid>

              {/* ── Options Section ───────────────────────────────────── */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Options &amp; Add-ons ({values.options.length})
                  </Typography>
                </Box>
                {typeof errors.options === "string" && (
                  <Typography color="error" variant="caption" sx={{ mb: 1, display: "block" }}>
                    {errors.options}
                  </Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldArray name="options">
                  {({ push, remove }) => (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {values.options.map((opt, index) => (
                        <Card
                          key={index}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                          }}
                        >
                          <CardContent sx={{ p: "0 !important" }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography variant="caption" fontWeight={600} color="text.secondary">
                                Option #{index + 1}
                              </Typography>
                              {values.options.length > 1 && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => remove(index)}
                                  title="Remove Option"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>

                            <Grid container spacing={1.5}>
                              {/* Option Name */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  name={`options.${index}.name`}
                                  label="Option Name *"
                                  size="small"
                                  fullWidth
                                  value={opt.name}
                                  onChange={handleChange}
                                  placeholder="e.g. Extra Choco Chips"
                                />
                              </Grid>

                              {/* Price */}
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                  name={`options.${index}.price`}
                                  label="Price (₹) *"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  value={opt.price}
                                  onChange={handleChange}
                                  helperText="0 = Free"
                                />
                              </Grid>

                              {/* Dietary Status */}
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Dietary</InputLabel>
                                  <Select
                                    name={`options.${index}.dietaryStatus`}
                                    value={opt.dietaryStatus || "VEG"}
                                    label="Dietary"
                                    onChange={handleChange}
                                  >
                                    <MenuItem value="VEG">Veg (Green)</MenuItem>
                                    <MenuItem value="NON_VEG">Non-Veg (Red)</MenuItem>
                                    <MenuItem value="EGG">Contains Egg</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>

                              {/* Flags */}
                              <Grid size={{ xs: 6 }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      size="small"
                                      checked={Boolean(opt.isDefault)}
                                      onChange={(e) =>
                                        setFieldValue(`options.${index}.isDefault`, e.target.checked)
                                      }
                                    />
                                  }
                                  label={
                                    <Typography variant="caption">Pre-selected</Typography>
                                  }
                                />
                              </Grid>

                              <Grid size={{ xs: 6 }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      size="small"
                                      checked={opt.inStock !== false}
                                      onChange={(e) =>
                                        setFieldValue(`options.${index}.inStock`, e.target.checked)
                                      }
                                    />
                                  }
                                  label={
                                    <Typography variant="caption">In Stock</Typography>
                                  }
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}

                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() =>
                          push({
                            name: "",
                            price: 0,
                            isDefault: false,
                            inStock: true,
                            dietaryStatus: "VEG",
                            displayOrder: values.options.length,
                          })
                        }
                        sx={{ mt: 1, alignSelf: "flex-start" }}
                        size="small"
                      >
                        Add Another Option
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Grid>
            </Grid>
          </Box>

          {/* ── Fixed Footer ───────────────────────────────────────────── */}
          <Box
            sx={{
              borderTop: 1,
              borderColor: "divider",
              p: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Button variant="outlined" color="inherit" onClick={closeDrawer} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={submitForm}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isEditing ? "Update Modifier Group" : "Create Modifier Group"}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
}
