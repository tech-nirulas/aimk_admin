"use client";

import { MaterialDateField, MaterialMultiSelectField, MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import { useGetAllCategoriesQuery } from "@/features/categories/categoriesApiService";
import { useCreateDiscountMutation, useUpdateDiscountMutation } from "@/features/discounts/discountApiService";
import { useGetAllProductsQuery } from "@/features/products/productApiService";
import { useToast } from "@/hooks/useToast";
import { Brand } from "@/interfaces/brand.interface";
import { Category } from "@/interfaces/category.interface";
import { DiscountPayloadBase } from "@/interfaces/discount.interface";
import { Product } from "@/interfaces/product.interface";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import DiscountValidator from "@/utils/validators/discount.validator";
import { Box, Button, Checkbox, CircularProgress, FormControlLabel, Grid, Tooltip, Typography, useTheme } from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function DiscountForm({ refetch }: { refetch?: () => void }) {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();
  const theme = useTheme();

  const selectedDiscount = useSelector(
    (state: any) => state.discountReducer?.selectedDiscount
  );

  const [createDiscount, { isLoading: isCreateDiscountLoading, isSuccess: isCreateSuccess, isError: isCreateDiscountError, error: createDiscountError }] =
    useCreateDiscountMutation();

  const [updateDiscount, { isLoading: isUpdateDiscountLoading, isSuccess: isUpdateSuccess, isError: isUpdateDiscountError, error: updateDiscountError }] =
    useUpdateDiscountMutation();

  const { data: productsData } = useGetAllProductsQuery(null);
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: brandsData } = useGetAllBrandsQuery();

  const productsList = productsData?.data || productsData || [];
  const categoriesList = categoriesData?.data || categoriesData || [];
  const brandsList = brandsData?.data || brandsData || [];

  const initialValues: any = {
    name: selectedDiscount?.name || "",
    description: selectedDiscount?.description || "",
    type: selectedDiscount?.type || "PERCENTAGE",
    value: selectedDiscount?.value ? Number(selectedDiscount.value) : "",
    discountOnAll: Boolean(selectedDiscount?.discountOnAll),
    brands: selectedDiscount?.brands?.map((b: Brand) => b.id) || [],
    categories: selectedDiscount?.categories?.map((c: Category) => c.id) || [],
    products: selectedDiscount?.products?.map((p: Product) => p.id) || [],
    excludedBrands: selectedDiscount?.excludedBrands?.map((b: Brand) => b.id) || [],
    excludedCategories: selectedDiscount?.excludedCategories?.map((c: Category) => c.id) || [],
    excludedProducts: selectedDiscount?.excludedProducts?.map((p: Product) => p.id) || [],
    startsAt: selectedDiscount?.startsAt ? new Date(selectedDiscount.startsAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    endsAt: selectedDiscount?.endsAt ? new Date(selectedDiscount.endsAt).toISOString().split("T")[0] : "",
    isActive: selectedDiscount?.isActive ?? true,
    priority: selectedDiscount?.priority ?? 0,
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload: DiscountPayloadBase = {
        ...values,
        value: Number(values.value),
        priority: Number(values.priority),
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : (undefined as any),
      };

      if (isEditing && selectedDiscount?.id) {
        await updateDiscount({
          id: selectedDiscount.id,
          body: payload,
        }).unwrap();
      } else {
        await createDiscount(payload).unwrap();
      }
    } catch (e) {
      console.error("Discount submit error:", e);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Discount Created Successfully", "success");
      if (refetch) refetch();
      closeDrawer();
    }

    if (isUpdateSuccess) {
      showToast("Discount Updated Successfully", "success");
      if (refetch) refetch();
      closeDrawer();
    }

    if (isCreateDiscountError) {
      showToast((createDiscountError as any)?.data?.message || "Failed to create discount", "error");
    }

    if (isUpdateDiscountError) {
      showToast((updateDiscountError as any)?.data?.message || "Failed to update discount", "error");
    }
  }, [
    isCreateSuccess,
    isUpdateSuccess,
    isCreateDiscountError,
    isUpdateDiscountError,
    createDiscountError,
    updateDiscountError,
    closeDrawer,
    refetch,
    showToast,
  ]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={DiscountValidator.createDiscountSchema}
      enableReinitialize
    >
      {({ isSubmitting, resetForm, values, handleChange }) => (
        <Form className="flex flex-col" style={{ height: "100%" }}>
          {/* Scrollable Content Area */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <Box className="p-4">
              <Box className="mb-6" sx={{ bgcolor: theme.palette.primary.main, padding: 1, borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.contrastText, fontWeight: 700 }}>
                  Basic Information
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{xs:12}}>
                  <MaterialTextField name="name" label="Discount Name" required />
                </Grid>
                <Grid size={{xs:12}}>
                  <MaterialTextField name="description" label="Discount Description" multiline rows={2} required />
                </Grid>
                <Grid size={{xs:12}}>
                  <MaterialSelectField
                    name="type"
                    label="Discount Type"
                    options={[
                      { label: "Percentage (%)", value: "PERCENTAGE" },
                      { label: "Fixed Amount (₹)", value: "FIXED_AMOUNT" },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <MaterialTextField name="value" label="Discount Value" type="number" required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Tooltip title="If enabled, this discount will be applied across all products">
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="discountOnAll"
                          checked={Boolean(values.discountOnAll)}
                          onChange={handleChange}
                        />
                      }
                      label="Apply discount on all products"
                    />
                  </Tooltip>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <SectionHeader>Inclusion Criteria</SectionHeader>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MaterialMultiSelectField
                    name="products"
                    label="Products"
                    options={productsList.map((product: Product) => ({
                      value: product.id,
                      label: `${product.name} (${product.sku})`,
                    }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MaterialMultiSelectField
                    name="categories"
                    label="Categories"
                    options={categoriesList.map((category: Category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MaterialMultiSelectField
                    name="brands"
                    label="Brands"
                    options={brandsList.map((brand: Brand) => ({
                      value: brand.id,
                      label: brand.name,
                    }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <SectionHeader>Exclusion Criteria</SectionHeader>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MaterialMultiSelectField
                    name="excludedProducts"
                    label="Excluded Products"
                    options={productsList.map((product: Product) => ({
                      value: product.id,
                      label: `${product.name} (${product.sku})`,
                    }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MaterialMultiSelectField
                    name="excludedCategories"
                    label="Excluded Categories"
                    options={categoriesList.map((category: Category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MaterialMultiSelectField
                    name="excludedBrands"
                    label="Excluded Brands"
                    options={brandsList.map((brand: Brand) => ({
                      value: brand.id,
                      label: brand.name,
                    }))}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <MaterialDateField name="startsAt" label="Start Date" required />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <MaterialDateField name="endsAt" label="End Date" required />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <MaterialSelectField
                    name="isActive"
                    label="Is Active"
                    options={[
                      { label: "Active", value: true },
                      { label: "Inactive", value: false },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <MaterialTextField name="priority" label="Priority Order" type="number" required />
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Fixed Bottom Action Buttons */}
          <Box
            sx={{
              borderTop: 1,
              borderColor: "divider",
              p: 2,
              display: "flex",
              gap: 2,
              backgroundColor: theme.palette.background.paper,
              position: "sticky",
              bottom: 0,
              zIndex: 1,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || isCreateDiscountLoading || isUpdateDiscountLoading}
              sx={{ minWidth: 100 }}
            >
              {isSubmitting || isCreateDiscountLoading || isUpdateDiscountLoading ? (
                <CircularProgress color="inherit" size={24} />
              ) : (
                "Submit"
              )}
            </Button>

            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={() => resetForm()}
              disabled={isSubmitting || isCreateDiscountLoading || isUpdateDiscountLoading}
              sx={{ minWidth: 100 }}
            >
              Reset
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
}