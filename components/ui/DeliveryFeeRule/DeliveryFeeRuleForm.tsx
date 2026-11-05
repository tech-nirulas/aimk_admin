"use client";

import { useCreateDeliveryFeeRuleMutation, useUpdateDeliveryFeeRuleMutation } from "@/features/delivery-fee/deliveryFeeApiService";
import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { Box, Button, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function DeliveryFeeRuleForm({ refetch }: { refetch?: () => void }) {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();

  const selectedRule = useSelector((state: any) => state.deliveryFeeReducer?.selectedRule);

  const [createRule, { isLoading: isCreateLoading, isSuccess: isCreateSuccess, isError: isCreateError, error: createError }] =
    useCreateDeliveryFeeRuleMutation();
  const [updateRule, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] =
    useUpdateDeliveryFeeRuleMutation();

  const initialValues = {
    name: selectedRule?.name || "",
    orderType: selectedRule?.orderType || "delivery",
    deliveryWindow: selectedRule?.deliveryWindow || "standard",
    minSubtotal: selectedRule?.minSubtotal !== undefined && selectedRule?.minSubtotal !== null ? Number(selectedRule.minSubtotal) : 0,
    fee: selectedRule?.fee !== undefined && selectedRule?.fee !== null ? Number(selectedRule.fee) : "",
    serviceChargePct: selectedRule?.serviceChargePct ? Number(selectedRule.serviceChargePct) : 0,
    priority: selectedRule?.priority ?? 0,
    isActive: selectedRule?.isActive ?? true,
  };

  const validate = (values: any) => {
    const errors: any = {};
    if (!values.name?.trim()) errors.name = "Rule name is required";
    if (values.fee === "" || values.fee === null || values.fee === undefined || Number(values.fee) < 0)
      errors.fee = "Fee is required (0 = free delivery)";
    if (Number(values.minSubtotal) < 0) errors.minSubtotal = "Cannot be negative";
    if (Number(values.serviceChargePct) < 0 || Number(values.serviceChargePct) > 100)
      errors.serviceChargePct = "Must be between 0 and 100";
    return errors;
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      name: values.name.trim(),
      orderType: values.orderType,
      deliveryWindow: values.deliveryWindow,
      minSubtotal: Number(values.minSubtotal),
      fee: Number(values.fee),
      serviceChargePct: Number(values.serviceChargePct),
      priority: Number(values.priority),
      isActive: values.isActive,
    };

    try {
      if (isEditing && selectedRule?.id) {
        await updateRule({ id: selectedRule.id, ...payload }).unwrap();
      } else {
        await createRule(payload).unwrap();
      }
    } catch (e) {
      console.error("Delivery fee rule submit error:", e);
    }
  };

  const isLoading = isCreateLoading || isUpdateLoading;

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Delivery fee rule created", "success");
      if (refetch) refetch();
      closeDrawer();
    }
    if (isUpdateSuccess) {
      showToast("Delivery fee rule updated", "success");
      if (refetch) refetch();
      closeDrawer();
    }
    if (isCreateError) {
      showToast((createError as any)?.data?.message || "Failed to create rule", "error");
    }
    if (isUpdateError) {
      showToast((updateError as any)?.data?.message || "Failed to update rule", "error");
    }
  }, [
    isCreateSuccess,
    isUpdateSuccess,
    isCreateError,
    isUpdateError,
    createError,
    updateError,
    closeDrawer,
    refetch,
    showToast,
  ]);

  return (
    <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit} enableReinitialize>
      {({ values, handleChange, errors, touched, isSubmitting }) => (
        <Form className="flex flex-col" style={{ height: "100%" }}>
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <Box className="p-4">
              <Typography variant="caption" sx={{ display: "block", mb: 2, color: "text.secondary" }}>
                The highest-priority active rule matching order type, window and minimum subtotal sets the
                delivery fee. The fee is the all-inclusive amount the customer pays.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Rule Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    error={touched.name && !!errors.name}
                    helperText={(touched.name && String(errors.name || "")) || ""}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Order Type</InputLabel>
                    <Select name="orderType" value={values.orderType} label="Order Type" onChange={handleChange}>
                      <MenuItem value="delivery">Delivery</MenuItem>
                      <MenuItem value="pickup">Pickup</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Delivery Window</InputLabel>
                    <Select name="deliveryWindow" value={values.deliveryWindow} label="Delivery Window" onChange={handleChange}>
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="early_morning">Early Morning (4–8am)</MenuItem>
                      <MenuItem value="midnight">Midnight (12–4am)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Min Subtotal (₹)"
                    name="minSubtotal"
                    type="number"
                    value={values.minSubtotal}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    error={touched.minSubtotal && !!errors.minSubtotal}
                    helperText={(touched.minSubtotal && String(errors.minSubtotal || "")) || ""}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Fee (₹, all-inclusive)"
                    name="fee"
                    type="number"
                    value={values.fee}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    error={touched.fee && !!errors.fee}
                    helperText={(touched.fee && String(errors.fee || "")) || "0 = free delivery"}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Service Charge % (inside fee)"
                    name="serviceChargePct"
                    type="number"
                    value={values.serviceChargePct}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    error={touched.serviceChargePct && !!errors.serviceChargePct}
                    helperText={(touched.serviceChargePct && String(errors.serviceChargePct || "")) || "18% of ₹99 ≈ ₹15.10 internal split"}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Priority (higher wins)"
                    name="priority"
                    type="number"
                    value={values.priority}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Switch checked={values.isActive} onChange={handleChange} name="isActive" color="primary" />
                    <Typography variant="body2">Rule active</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || isLoading}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              {isLoading ? <CircularProgress size={20} /> : isEditing ? "Update Rule" : "Create Rule"}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
}
