"use client";

import MediaPickerModal, { MediaItem } from "@/components/ui/Media/MediaPickerModal";
import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { Box, Button, CircularProgress, Grid, IconButton, Typography, useTheme } from "@mui/material";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useSelector } from "react-redux";

import {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useUpdateCategoryMutation
} from "@/features/categories/categoriesApiService";

import { MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import { Category, CreateCategoryPayload } from "@/interfaces/category.interface";
import CategoryValidator from "@/utils/validators/category.validator";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { Field } from "formik";
import { useEffect } from "react";
import { Brand } from "@/interfaces/brand.interface";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";

export default function CategoryForm() {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();

  const theme = useTheme();

  const selectedCategory = useSelector(
    (state: any) => state.categoryReducer.selectedCategory
  );

  const [createCategory, { isLoading: isCreateCategoryLoading, isSuccess: isCreateSuccess, isError: isCreateCategoryError, error: createCategoryError }] =
    useCreateCategoryMutation();

  const [updateCategory, { isLoading: isUpdateCategoryLoading, isSuccess: isUpdateSuccess, isError: isUpdateCategoryError, error: updateCategoryError }] =
    useUpdateCategoryMutation();

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: brandsData } = useGetAllBrandsQuery();

  const initialValues: CreateCategoryPayload = {
    name: selectedCategory?.name || "",
    description: selectedCategory?.description || "",
    categoryImageId: selectedCategory?.categoryImageId || "",
    displayOrder: selectedCategory?.displayOrder || 0,
    brandId: selectedCategory?.brandId || "",
    parentId: selectedCategory?.parentId || "",
  };

  const handleSubmit = async (values: CreateCategoryPayload) => {
    try {

      const { categoryImageUrl, ...rest } = values;

      const payload = {
        ...rest,
        categoryImageId: rest.categoryImageId || null,
        parentId: rest.parentId || null,
      };

      if (isEditing) {
        await updateCategory({
          id: selectedCategory.id,
          body: payload,
        });
      } else {
        await createCategory(payload);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Category Created", "success");
      closeDrawer();
    }

    if (isUpdateSuccess) {
      showToast("Category Updated", "success");
      closeDrawer();
    }

    if (isCreateCategoryError) {
      showToast(createCategoryError.data.message, "error");
    }

    if (isUpdateCategoryError) {
      showToast(updateCategoryError.data.message, "error");
    }

  }, [isCreateSuccess, isUpdateSuccess, isCreateCategoryError, isUpdateCategoryError, createCategoryError, updateCategoryError, showToast, closeDrawer])

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={CategoryValidator.createCategorySchema}>
      {({ isSubmitting, resetForm }) => (
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
                  <MaterialTextField name="name" label="Category Name" />
                </Grid>

                <Grid item xs={12}>
                  <MaterialTextField
                    name="description"
                    label="Description"
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <MaterialTextField name="displayOrder" label="Display Order" type="number" />
                </Grid>

                {/* Replace the image MaterialTextField with this */}
                <Grid item xs={12}>
                  <Field name="categoryImageId">
                    {({ field, form }: any) => (
                      <Box>
                        {/* Preview */}
                        {field.value && (
                          <Box
                            sx={{
                              mb: 1,
                              borderRadius: 2,
                              overflow: "hidden",
                              border: "1px solid",
                              borderColor: "divider",
                              width: "100%",
                              height: 140,
                              position: "relative",
                            }}
                          >
                            <Box
                              component="img"
                              src={form.values.categoryImageUrl}
                              alt="Category image"
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                form.setFieldValue("categoryImageId", "");
                                form.setFieldValue("categoryImageUrl", "");
                              }}
                              sx={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                bgcolor: "rgba(15,23,42,0.7)",
                                color: "white",
                                "&:hover": { bgcolor: "error.main" },
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        )}

                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => setPickerOpen(true)}
                          startIcon={<ImageIcon />}
                          sx={{ justifyContent: "flex-start", color: "text.secondary" }}
                        >
                          {field.value ? "Change Image" : "Select Image"}
                        </Button>

                        <MediaPickerModal
                          open={pickerOpen}
                          onClose={() => setPickerOpen(false)}
                          allowedTypes={["image"]}
                          title="Select Category Image"
                          onSelect={(media) => {
                            const m = media as MediaItem;

                            form.setFieldValue("categoryImageId", m.id);
                            form.setFieldValue("categoryImageUrl", m.url);

                            setPickerOpen(false);
                          }}
                        />
                      </Box>
                    )}
                  </Field>
                </Grid>

                <Grid item xs={12}>
                  <MaterialSelectField
                    name="parentId"
                    label="Parent Category Id"
                    options={categoriesData?.data?.map((cat: Category) => ({
                      value: cat.id,
                      label: cat.name,
                    })) || []}
                  />
                </Grid>

                <Grid item xs={12}>
                  <MaterialSelectField
                    name="brandId"
                    label="Brand Id"
                    options={brandsData?.data?.map((brand: Brand) => ({
                      value: brand.id,
                      label: brand.name,
                    })) || []}
                  />
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
              disabled={isSubmitting || isCreateCategoryLoading || isUpdateCategoryLoading}
              sx={{ minWidth: 100 }}
            >
              {(isSubmitting || isCreateCategoryLoading || isUpdateCategoryLoading) ? <CircularProgress color="primary" size={24} /> : "Submit"}
            </Button>

            <Button
              type="reset"
              variant="outlined"
              color="primary"
              onClick={() => resetForm()}
              disabled={isSubmitting || isCreateCategoryLoading || isUpdateCategoryLoading}
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