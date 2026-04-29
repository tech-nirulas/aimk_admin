"use client";

import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { Box, Button, Checkbox, CircularProgress, FormControlLabel, Grid, Tooltip, Typography, useTheme } from "@mui/material";
import { Form, Formik } from "formik";
import { useSelector } from "react-redux";


import { MaterialDateField, MaterialMultiSelectField, MaterialTextField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import { useGetAllCategoriesQuery } from "@/features/categories/categoriesApiService";
import { useCreateDiscountMutation, useUpdateDiscountMutation } from "@/features/discounts/discountApiService";
import { useGetAllProductsQuery } from "@/features/products/productApiService";
import { Brand } from "@/interfaces/brand.interface";
import { Category } from "@/interfaces/category.interface";
import { DiscountPayloadBase } from "@/interfaces/discount.interface";
import { Product } from "@/interfaces/product.interface";
import DiscountValidator from "@/utils/validators/discount.validator";
import { useEffect } from "react";

export default function DiscountForm() {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();

  const theme = useTheme();

  const selectedDiscount = useSelector(
    (state: any) => state.discountReducer.selectedDiscount
  );

  const [createDiscount, { isLoading: isCreateDiscountLoading, isSuccess: isCreateSuccess, isError: isCreateDiscountError, error: createDiscountError }] =
    useCreateDiscountMutation();

  const [updateDiscount, { isLoading: isUpdateDiscountLoading, isSuccess: isUpdateSuccess, isError: isUpdateDiscountError, error: updateDiscountError }] =
    useUpdateDiscountMutation();

  const { data: products } = useGetAllProductsQuery(null);
  const { data: categories } = useGetAllCategoriesQuery();
  const { data: brands } = useGetAllBrandsQuery();

  const initialValues: DiscountPayloadBase = {
    name: selectedDiscount?.name || "",
    description: selectedDiscount?.description || "",
    endsAt: selectedDiscount?.endsAt || "",
    isActive: selectedDiscount?.isActive || true,
    startsAt: selectedDiscount?.startsAt || "",
    type: selectedDiscount?.type || "",
    value: selectedDiscount?.value || "",
    brands: selectedDiscount?.brands || "",
    categories: selectedDiscount?.categories || "",
    products: selectedDiscount?.products || "",
    discountOnAll: selectedDiscount?.discountOnAll || false,
    excludedBrands: selectedDiscount?.excludedBrands || "",
    excludedCategories: selectedDiscount?.excludedCategories || "",
    excludedProducts: selectedDiscount?.excludedProducts || "",
    priority: selectedDiscount?.priority || false,
  };

  const handleSubmit = async (values: DiscountPayloadBase) => {
    try {
      if (isEditing) {
        await updateDiscount({
          id: selectedDiscount.id,
          body: values,
        });
      } else {
        await createDiscount(values);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Discount Created", "success");
      closeDrawer();
    }

    if (isUpdateSuccess) {
      showToast("Discount Updated", "success");
      closeDrawer();
    }

    if (isCreateDiscountError) {
      showToast(createDiscountError?.data?.message, "error");
    }

    if (isUpdateDiscountError) {
      showToast(updateDiscountError?.data?.message, "error");
    }

  }, [isCreateSuccess, isUpdateSuccess, isCreateDiscountError, isUpdateDiscountError, createDiscountError, updateDiscountError, showToast, closeDrawer])

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={DiscountValidator.createDiscountSchema}
    >
      {({ isSubmitting, resetForm, values, handleChange }) => (
        <Form className="flex flex-col" style={{ height: "100%" }}>
          {/* Scrollable Content Area */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <Box className="p-4">
              <Box className="mb-6" sx={{ bgcolor: theme.palette.primary.main, padding: 1, borderRadius: 1 }}>
                <Typography variant='subtitle1' sx={{ color: theme.palette.primary.contrastText }}>
                  Basic Information
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MaterialTextField name="name" label="Discount Name" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="description" label="Discount Description" />
                </Grid>
                <Grid item xs={6}>
                  <MaterialTextField name="type" label="Discount type" />
                </Grid>
                <Grid item xs={6}>
                  <MaterialTextField name="value" label="Discount Value" />
                </Grid>
                <Grid item xs={12}>
                  <Tooltip title="If enabled then discount will be applied to all products across platform">
                    <FormControlLabel
                      control={
                        <Checkbox name="featured" checked={values.discountOnAll} onChange={handleChange} />
                      }
                      label="Discount on all"
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <SectionHeader>Inclusion Critieria</SectionHeader>
                </Grid>
                <Grid item xs={12}>
                  <MaterialMultiSelectField
                    name="products"
                    label="Products"
                    options={products?.data?.map((product: Product) => ({
                      value: product.id,
                      label: product.name,
                    })) || []}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MaterialMultiSelectField
                    name="categories"
                    label="Categories"
                    options={categories?.data?.map((category: Category) => ({
                      value: category.id,
                      label: category.name,
                    })) || []}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MaterialMultiSelectField
                    name="brands"
                    label="Brands"
                    options={brands?.data?.map((brand: Brand) => ({
                      value: brand.id,
                      label: brand.name,
                    })) || []}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SectionHeader>Exclusion Critieria</SectionHeader>
                </Grid>
                <Grid item xs={12}>
                  <MaterialMultiSelectField
                    name="excludedProducts"
                    label="Excluded Products"
                    options={products?.data?.map((product: Product) => ({
                      value: product.id,
                      label: product.name,
                    })) || []}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MaterialMultiSelectField
                    name="excludedCategories"
                    label="Excluded Categories"
                    options={categories?.data?.map((category: Category) => ({
                      value: category.id,
                      label: category.name,
                    })) || []}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MaterialMultiSelectField
                    name="excludedBrands"
                    label="Excluded Brands"
                    options={brands?.data?.map((brand: Brand) => ({
                      value: brand.id,
                      label: brand.name,
                    })) || []}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MaterialDateField name="startsAt" label="Start Date" />
                </Grid>
                <Grid item xs={6}>
                  <MaterialDateField name="endsAt" label="End Date" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="name" label="Discount Name" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="name" label="Discount Name" />
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Fixed Bottom Buttons */}
          <Box sx={{
            borderTop: 1,
            borderColor: 'divider',
            p: 2,
            display: 'flex',
            gap: 2,
            backgroundColor: theme.palette.background.paper,
            position: 'sticky',
            bottom: 0,
            zIndex: 1
          }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || isCreateDiscountLoading || isUpdateDiscountLoading}
              sx={{ minWidth: 100 }}
            >
              {(isSubmitting || isCreateDiscountLoading || isUpdateDiscountLoading) ? <CircularProgress color="primary" size={24} /> : "Submit"}
            </Button>

            <Button
              type="reset"
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