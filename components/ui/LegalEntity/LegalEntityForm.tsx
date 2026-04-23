"use client";

import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { Box, Button, CircularProgress, Grid, Typography, useTheme } from "@mui/material";
import { Form, Formik } from "formik";
import { useSelector } from "react-redux";


import { MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import { useCreateLegalEntityMutation, useUpdateLegalEntityMutation } from "@/features/legal-entity/legalEntitiesApiService";
import { CreateLegalEntityPayload } from "@/interfaces/legal-entity.interface";
import LegalEntityValidator from "@/utils/validators/legal-entity.validator";
import { useEffect } from "react";

export default function LegalEntityForm() {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();

  const theme = useTheme();

  const selectedLegalEntity = useSelector(
    (state: any) => state.legalEntityReducer.selectedLegalEntity
  );

  const [createLegalEntity, { isLoading: isCreateLegalEntityLoading, isSuccess: isCreateLegalEntitySuccess, isError: isCreateLegalEntityError, error: createLegalEntityError }] =
    useCreateLegalEntityMutation();

  const [updateLegalEntity, { isLoading: isUpdateLegalEntityLoading, isSuccess: isUpdateLegalEntitySuccess, isError: isUpdateLegalEntityError, error: updateLegalEntityError }] =
    useUpdateLegalEntityMutation();

  const initialValues: CreateLegalEntityPayload = {
    name: selectedLegalEntity?.name ?? "",
    legalName: selectedLegalEntity?.legalName ?? "",
    address: selectedLegalEntity?.address ?? "",
    bankAccountName: selectedLegalEntity?.bankAccountName ?? "",
    bankAccountNumber: selectedLegalEntity?.bankAccountNumber ?? "",
    bankIfsc: selectedLegalEntity?.bankIfsc ?? "",
    city: selectedLegalEntity?.city ?? "",
    commissionRate: selectedLegalEntity?.comminssionRate ?? "",
    contactEmail: selectedLegalEntity?.contactEmail ?? "",
    contactPhone: selectedLegalEntity?.contactPhone ?? "",
    gstin: selectedLegalEntity?.gstin ?? "",
    isDefault: selectedLegalEntity?.isDefault ?? false,
    pan: selectedLegalEntity?.pan ?? "",
    pincode: selectedLegalEntity?.pincode ?? "",
    state: selectedLegalEntity?.state ?? "",
  };

  const handleSubmit = async (values: CreateLegalEntityPayload) => {
    try {
      if (isEditing) {
        await updateLegalEntity({
          id: selectedLegalEntity.id,
          body: values,
        });
      } else {
        await createLegalEntity(values);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isCreateLegalEntitySuccess) {
      showToast("Legal Entity Created", "success");
      closeDrawer();
    }

    if (isUpdateLegalEntitySuccess) {
      showToast("Legal Entity Updated", "success");
      closeDrawer();
    }

    if (isCreateLegalEntityError) {
      showToast(createLegalEntityError.data.message, "error");
    }

    if (isUpdateLegalEntityError) {
      showToast(updateLegalEntityError.data.message, "error");
    }

  }, [
    showToast,
    closeDrawer,
    isCreateLegalEntitySuccess,
    isUpdateLegalEntitySuccess,
    isCreateLegalEntityError,
    isUpdateLegalEntityError,
    createLegalEntityError,
    updateLegalEntityError
  ])

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={LegalEntityValidator.createLegalEntitySchema}
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
                  <MaterialTextField name="name" label="Entity Name" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="legalName" label="Legal Entity Name" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="gstin" label="GST-IN" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="pan" label="PAN" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="address" label="Address" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="city" label="City" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="state" label="State" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="pincode" label="Pincode" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="contactEmail" label="Contact Email" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="contactPhone" label="Contact Phone" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialSelectField
                    name="isDefault"
                    label="Is Default"
                    options={[{
                      value: true,
                      label: "Yes",
                    }, {
                      value: false,
                      label: "No",
                    }]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="bankAccountName" label="Bank Account Name" />
                </Grid><Grid item xs={12}>
                  <MaterialTextField name="bankAccountNumber" label="Bank Account Number" />
                </Grid><Grid item xs={12}>
                  <MaterialTextField name="bankIfsc" label="Bank IFSC" />
                </Grid><Grid item xs={12}>
                  <MaterialTextField name="commissionRate" label="Commission Rate" type="number" />
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
              disabled={isSubmitting || isCreateLegalEntityLoading || isUpdateLegalEntityLoading}
              sx={{ minWidth: 100 }}
            >
              {(isSubmitting || isCreateLegalEntityLoading || isUpdateLegalEntityLoading) ? <CircularProgress color="primary" size={24} /> : "Submit"}
            </Button>

            <Button
              type="reset"
              variant="outlined"
              color="primary"
              onClick={() => resetForm()}
              disabled={isSubmitting || isCreateLegalEntityLoading || isUpdateLegalEntityLoading}
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