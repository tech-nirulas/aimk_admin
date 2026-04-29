"use client";

import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { Box, Button, CircularProgress, Grid, Typography, useTheme } from "@mui/material";
import { Form, Formik } from "formik";
import { useSelector } from "react-redux";


import { MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import { useCreateBrandMutation, useUpdateBrandMutation } from "@/features/brand/brandApiService";
import { useGetAllLegalEntitiesQuery } from "@/features/legal-entity/legalEntitiesApiService";
import { CreateBrandPayload } from "@/interfaces/brand.interface";
import { LegalEntity } from "@/interfaces/legal-entity.interface";
import BrandValidator from "@/utils/validators/brand.validator";
import { useEffect } from "react";

export default function BrandForm() {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();

  const theme = useTheme();

  const selectedBrand = useSelector(
    (state: any) => state.brandReducer.selectedBrand
  );

  const [createBrand, { isLoading: isCreateBrandLoading, isSuccess: isCreateSuccess, isError: isCreateBrandError, error: createBrandError }] =
    useCreateBrandMutation();

  const [updateBrand, { isLoading: isUpdateBrandLoading, isSuccess: isUpdateSuccess, isError: isUpdateBrandError, error: updateBrandError }] =
    useUpdateBrandMutation();

  const { data: legalEntitiesData } = useGetAllLegalEntitiesQuery();


  const initialValues: CreateBrandPayload = {
    name: selectedBrand?.name || "",
    legalEntityId: selectedBrand?.legalEntityId || "",
    isActive: selectedBrand?.isActive || false,
  };

  const handleSubmit = async (values: CreateBrandPayload) => {
    try {
      if (isEditing) {
        await updateBrand({
          id: selectedBrand.id,
          body: values,
        });
      } else {
        await createBrand(values);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Brand Created", "success");
      closeDrawer();
    }

    if (isUpdateSuccess) {
      showToast("Brand Updated", "success");
      closeDrawer();
    }

    if (isCreateBrandError) {
      showToast(createBrandError?.data?.message, "error");
    }

    if (isUpdateBrandError) {
      showToast(updateBrandError?.data?.message, "error");
    }

  }, [isCreateSuccess, isUpdateSuccess, isCreateBrandError, isUpdateBrandError, createBrandError, updateBrandError, showToast, closeDrawer])

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={BrandValidator.createBrandSchema}
    >
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
                  <MaterialTextField name="name" label="Brand Name" />
                </Grid>

                <Grid item xs={12}>
                  <MaterialSelectField
                    name="isActive"
                    label="Status"
                    options={[
                      { value: true, label: "Active" },
                      { value: false, label: "Inactive" }
                    ]}
                  />
                </Grid>

                <Grid item xs={12}>
                  <MaterialSelectField
                    name="legalEntityId"
                    label="Legal Entity"
                    options={legalEntitiesData?.data?.map((lE: LegalEntity) => ({
                      value: lE.id,
                      label: lE.name,
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
              disabled={isSubmitting || isCreateBrandLoading || isUpdateBrandLoading}
              sx={{ minWidth: 100 }}
            >
              {(isSubmitting || isCreateBrandLoading || isUpdateBrandLoading) ? <CircularProgress color="primary" size={24} /> : "Submit"}
            </Button>

            <Button
              type="reset"
              variant="outlined"
              color="primary"
              onClick={() => resetForm()}
              disabled={isSubmitting || isCreateBrandLoading || isUpdateBrandLoading}
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