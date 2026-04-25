"use client";

import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Skeleton,
  Typography,
  useTheme
} from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  MaterialMultiSelectField,
  MaterialSelectField,
  MaterialTextField,
} from "@/components/common/CustomFields";
import { useGetAllLegalEntitiesQuery } from "@/features/legal-entity/legalEntitiesApiService";
import {
  useCreateOutletMutation,
  useUpdateOutletMutation,
} from "@/features/outlets/outletsApiService";
import { CreateOutletPayload } from "@/interfaces/outlet.interface";
import OutletValidator from "@/utils/validators/outlet.validator";
import CoordinatesInput from "./CoordinatesInput";
import OpeningHoursInput from "./OpeningHoursInput";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";

// ─── Section header (same pattern as ProductForm) ────────────────────────────

const SectionHeader = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: theme.palette.primary.main,
        px: 2,
        py: 0.75,
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ color: theme.palette.primary.contrastText, fontWeight: 600 }}
      >
        {children}
      </Typography>
    </Box>
  );
};

// ─── Cutoff time options (30-min increments) ──────────────────────────────────

const CUTOFF_OPTIONS: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    const value = `${hh}:${mm}`;
    const period = h < 12 ? "AM" : "PM";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    CUTOFF_OPTIONS.push({ value, label: `${displayH}:${mm} ${period}` });
  }
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function OutletForm() {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();
  const theme = useTheme();

  const selectedOutlet = useSelector(
    (state: any) => state.outletReducer.selectedOutlet
  );

  const [
    createOutlet,
    {
      isLoading: isCreateOutletLoading,
      isSuccess: isCreateOutletSuccess,
      isError: isCreateOutletError,
      error: createOutletError,
    },
  ] = useCreateOutletMutation();

  const [
    updateOutlet,
    {
      isLoading: isUpdateOutletLoading,
      isSuccess: isUpdateOutletSuccess,
      isError: isUpdateOutletError,
      error: updateOutletError,
    },
  ] = useUpdateOutletMutation();

  const { data: legalEntities, isLoading: isLegalEntitiesLoading } =
    useGetAllLegalEntitiesQuery();

  const { data: brands, isLoading: isBrandsLoading } = useGetAllBrandsQuery();

  const initialValues: CreateOutletPayload = {
    name: selectedOutlet?.name ?? "",
    address: selectedOutlet?.address ?? "",
    city: selectedOutlet?.city ?? "",
    code: selectedOutlet?.code ?? "",
    // openingHours stores the full weekly schedule object
    openingHours: selectedOutlet?.openingHours ?? {},
    // coordinates stores { lat, lng }
    coordinates: selectedOutlet?.coordinates ?? {},
    email: selectedOutlet?.email ?? "",
    // legalEntityId: selectedOutlet?.legalEntityId ?? "",
    phone: selectedOutlet?.phone ?? "",
    pickupCutoffTime: selectedOutlet?.pickupCutoffTime ?? "16:00",
    pincode: selectedOutlet?.pincode ?? "",
    state: selectedOutlet?.state ?? "",
    brands: selectedOutlet?.brands ?? [],
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      if (isEditing) {
        await updateOutlet({ id: selectedOutlet.id, body: values });
      } else {
        await createOutlet(values);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isCreateOutletSuccess) {
      showToast("Outlet Created", "success");
      closeDrawer();
    }
    if (isUpdateOutletSuccess) {
      showToast("Outlet Updated", "success");
      closeDrawer();
    }
    if (isCreateOutletError)
      showToast((createOutletError as any)?.data?.message, "error");
    if (isUpdateOutletError)
      showToast((updateOutletError as any)?.data?.message, "error");
  }, [
    isCreateOutletSuccess,
    isUpdateOutletSuccess,
    isCreateOutletError,
    isUpdateOutletError,
    createOutletError,
    updateOutletError,
    showToast,
    closeDrawer,
  ]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={OutletValidator.createOutletSchema}
      validateOnChange={false}
      validateOnBlur={true}
      enableReinitialize={false}
    >
      {({ isSubmitting, resetForm }) => (
        <Form className="flex flex-col" style={{ height: "100%" }}>
          {/* ── Scrollable Content ──────────────────────────────────────── */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <Box className="p-4">
              {/* ── Basic Information ──────────────────────────────────── */}
              <SectionHeader>Basic Information</SectionHeader>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={8}>
                  <MaterialTextField name="name" label="Outlet Name" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MaterialTextField name="code" label="Outlet Code" />
                </Grid>
                <Grid item xs={12}>
                  <MaterialTextField name="address" label="Address" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MaterialTextField name="city" label="City" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MaterialTextField name="state" label="State" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MaterialTextField name="pincode" label="Pincode" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MaterialTextField name="phone" label="Phone" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MaterialTextField name="email" label="Email" />
                </Grid>
              </Grid>

              {/* ── Legal Entity ───────────────────────────────────────── */}
              {/* <SectionHeader>Legal Entity</SectionHeader>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  {isLegalEntitiesLoading ? (
                    <Skeleton width="100%" height={40} />
                  ) : (
                    <MaterialSelectField
                      name="legalEntityId"
                      label="Legal Entity"
                      options={
                        legalEntities?.data?.map((le) => ({
                          value: le.id,
                          label: le.name,
                        })) || []
                      }
                    />
                  )}
                </Grid>
              </Grid> */}

              {/* ── Brands ───────────────────────────────────────── */}
              <SectionHeader>Brands</SectionHeader>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  {isBrandsLoading ? (
                    <Skeleton width="100%" height={40} />
                  ) : (
                    <MaterialMultiSelectField
                      name="brands"
                      label="Brands"
                      options={
                        brands?.data?.map((brand) => ({
                          value: brand.id,
                          label: brand.name,
                        })) || []
                      }
                    />
                  )}
                </Grid>
              </Grid>

              {/* ── Location ───────────────────────────────────────────── */}
              <SectionHeader>Location Coordinates</SectionHeader>
              <Box mb={3}>
                <CoordinatesInput name="coordinates" />
              </Box>

              {/* ── Hours & Cutoff ─────────────────────────────────────── */}
              <SectionHeader>Operations</SectionHeader>
              <Grid container spacing={2} mb={3}>
                {/* Pickup cutoff time — now a proper time selector */}
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={0.75}
                    >
                      Pickup Cutoff Time
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={1}
                      sx={{ opacity: 0.7 }}
                    >
                      Orders placed after this time go to the next day&apos;s slot
                    </Typography>
                    {/* Using raw Formik Field so we can get form.setFieldValue */}
                    <MaterialSelectField
                      name="pickupCutoffTime"
                      label="Cutoff Time"
                      options={CUTOFF_OPTIONS}
                    />
                  </Box>
                </Grid>

                {/* Opening hours */}
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={1}
                  >
                    Set your weekly operating schedule. Supports split shifts
                    and quick presets.
                  </Typography>
                  <OpeningHoursInput name="openingHours" />
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* ── Fixed Bottom Buttons ──────────────────────────────────── */}
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
              disabled={
                isSubmitting || isCreateOutletLoading || isUpdateOutletLoading
              }
              sx={{ minWidth: 100 }}
            >
              {isSubmitting ||
                isCreateOutletLoading ||
                isUpdateOutletLoading ? (
                <CircularProgress color="primary" size={24} />
              ) : (
                "Submit"
              )}
            </Button>

            <Button
              type="reset"
              variant="outlined"
              color="primary"
              onClick={() => resetForm()}
              disabled={
                isSubmitting || isCreateOutletLoading || isUpdateOutletLoading
              }
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