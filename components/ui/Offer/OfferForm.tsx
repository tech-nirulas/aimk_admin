"use client";

import { MaterialDateField, MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import ImageSpecHint from "@/components/common/ImageSpecHint";
import SectionHeader from "@/components/common/SectionHeader";
import MediaPickerModal, { MediaItem } from "@/components/ui/Media/MediaPickerModal";
import { useGetAllCategoriesQuery } from "@/features/categories/categoriesApiService";
import { useCreateOfferMutation, useUpdateOfferMutation } from "@/features/offers/offerApiService";
import { useGetAllProductsQuery } from "@/features/products/productApiService";
import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import CollectionsIcon from "@mui/icons-material/Collections";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function OfferForm({ refetch }: { refetch?: () => void }) {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();
  const theme = useTheme();

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const selectedOffer = useSelector(
    (state: any) => state.offerReducer?.selectedOffer
  );

  const [createOffer, { isLoading: isCreateLoading, isSuccess: isCreateSuccess, isError: isCreateError, error: createError }] =
    useCreateOfferMutation();

  const [updateOffer, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] =
    useUpdateOfferMutation();

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: productsData } = useGetAllProductsQuery();

  const categoriesList = categoriesData?.data || categoriesData || [];
  const productsList = productsData?.data || productsData || [];

  // Populate initial values from selectedOffer if editing
  const existingBanner = selectedOffer?.banners?.[0];

  const initialValues = {
    title: selectedOffer?.title || "",
    description: selectedOffer?.description || "",
    code: selectedOffer?.code || "",
    offerType: selectedOffer?.offerType || "PERCENTAGE",
    discountPct: selectedOffer?.discountPct ? Number(selectedOffer.discountPct) : "",
    discountFlat: selectedOffer?.discountFlat ? Number(selectedOffer.discountFlat) : "",
    minOrderValue: selectedOffer?.minOrderValue ? Number(selectedOffer.minOrderValue) : "",
    maxDiscount: selectedOffer?.maxDiscount ? Number(selectedOffer.maxDiscount) : "",
    startsAt: selectedOffer?.startsAt ? new Date(selectedOffer.startsAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    expiresAt: selectedOffer?.expiresAt ? new Date(selectedOffer.expiresAt).toISOString().split("T")[0] : "",
    targetType: selectedOffer?.targetType || "ORDER",
    selectedCategoryId: selectedOffer?.categories?.[0]?.id || "",
    selectedProductId: selectedOffer?.products?.[0]?.id || "",
    // Banner config
    mediaId: existingBanner?.mediaId || "",
    mediaUrl: existingBanner?.media?.url || "",
    headline: existingBanner?.headline || "",
    subtext: existingBanner?.subtext || "",
    linkType: existingBanner?.linkType || "CATEGORY",
    linkCategoryId: existingBanner?.linkCategoryId || "",
    linkProductId: existingBanner?.linkProductId || "",
    linkUrl: existingBanner?.linkUrl || "",
    isActive: selectedOffer?.isActive ?? true,
  };

  useEffect(() => {
    if (existingBanner?.media) {
      setSelectedMedia({
        id: existingBanner.media.id,
        url: existingBanner.media.url,
        filename: existingBanner.media.filename || "Banner Image",
        mimeType: "image/jpeg",
        type: "image",
        size: 0,
        createdAt: new Date().toISOString(),
      });
    }
  }, [existingBanner]);

  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    const item = Array.isArray(media) ? media[0] : media;
    if (item) {
      setSelectedMedia(item);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const bannerMediaId = selectedMedia?.id || values.mediaId;

      const categoryIds = values.selectedCategoryId ? [values.selectedCategoryId] : undefined;
      const productIds = values.selectedProductId ? [values.selectedProductId] : undefined;

      const banners = bannerMediaId
        ? [
            {
              mediaId: bannerMediaId,
              linkType: values.linkType,
              linkCategoryId: values.linkCategoryId || undefined,
              linkProductId: values.linkProductId || undefined,
              linkUrl: values.linkUrl || undefined,
              headline: values.headline || undefined,
              subtext: values.subtext || undefined,
              displayOrder: 0,
            },
          ]
        : undefined;

      const payload = {
        title: values.title,
        description: values.description || undefined,
        code: values.code ? values.code.toUpperCase() : undefined,
        offerType: values.offerType,
        discountPct: values.discountPct ? Number(values.discountPct) : undefined,
        discountFlat: values.discountFlat ? Number(values.discountFlat) : undefined,
        minOrderValue: values.minOrderValue ? Number(values.minOrderValue) : undefined,
        maxDiscount: values.maxDiscount ? Number(values.maxDiscount) : undefined,
        startsAt: new Date(values.startsAt).toISOString(),
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
        targetType: values.targetType,
        categoryIds,
        productIds,
        banners,
        isActive: values.isActive,
      };

      if (isEditing && selectedOffer?.id) {
        await updateOffer({ id: selectedOffer.id, ...payload }).unwrap();
      } else {
        await createOffer(payload).unwrap();
      }
    } catch (e) {
      console.error("Offer submit error:", e);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Offer Published Successfully", "success");
      if (refetch) refetch();
      closeDrawer();
    }
    if (isUpdateSuccess) {
      showToast("Offer Updated Successfully", "success");
      if (refetch) refetch();
      closeDrawer();
    }
    if (isCreateError) {
      showToast((createError as any)?.data?.message || "Failed to publish offer", "error");
    }
    if (isUpdateError) {
      showToast((updateError as any)?.data?.message || "Failed to update offer", "error");
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
    <>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
        {({ isSubmitting, resetForm, values, handleChange }) => (
          <Form className="flex flex-col" style={{ height: "100%" }}>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <Box className="p-4">
                {/*
                  Hero banner requirements, read from the shared @aimk/image-spec
                  package — the same source the storefront and IMAGE_GUIDELINES.md
                  consume. This replaced a hardcoded block whose dimensions and
                  ratio did not match the storefront, and which advertised a
                  separate mobile asset that the storefront does not render.
                  Never hardcode dimensions here again.
                */}
                <Box sx={{ mb: 3 }}>
                  <ImageSpecHint slot="heroBanner" dimensions={selectedMedia} />
                </Box>

                <Box className="mb-4" sx={{ bgcolor: theme.palette.primary.main, padding: 1, borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.primary.contrastText, fontWeight: 700 }}>
                    1. Campaign Info
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <MaterialTextField name="title" label="Offer Title" required />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MaterialTextField name="code" label="Promo Code (Optional)" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MaterialSelectField
                      name="offerType"
                      label="Offer Type"
                      options={[
                        { label: "Percentage (%)", value: "PERCENTAGE" },
                        { label: "Flat Amount (₹)", value: "FLAT" },
                      ]}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    {values.offerType === "PERCENTAGE" ? (
                      <MaterialTextField name="discountPct" label="Discount Percentage (%)" type="number" required />
                    ) : (
                      <MaterialTextField name="discountFlat" label="Flat Discount (₹)" type="number" required />
                    )}
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MaterialTextField name="minOrderValue" label="Min Order Value (₹)" type="number" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MaterialSelectField
                      name="targetType"
                      label="Target Scope"
                      options={[
                        { label: "Entire Cart / Order", value: "ORDER" },
                        { label: "Specific Category", value: "CATEGORY" },
                        { label: "Specific Product", value: "PRODUCT" },
                      ]}
                    />
                  </Grid>

                  {values.targetType === "CATEGORY" && (
                    <Grid size={{ xs: 6 }}>
                      <MaterialSelectField
                        name="selectedCategoryId"
                        label="Target Category"
                        options={categoriesList.map((cat: any) => ({
                          label: cat.name,
                          value: cat.id,
                        }))}
                      />
                    </Grid>
                  )}

                  {values.targetType === "PRODUCT" && (
                    <Grid size={{ xs: 6 }}>
                      <MaterialSelectField
                        name="selectedProductId"
                        label="Target Product"
                        options={productsList.map((prod: any) => ({
                          label: `${prod.name} (${prod.sku})`,
                          value: prod.id,
                        }))}
                      />
                    </Grid>
                  )}

                  <Grid size={{ xs: 6 }}>
                    <MaterialDateField name="startsAt" label="Start Date" required />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <MaterialTextField name="description" label="Description" multiline rows={2} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <SectionHeader>2. Hero Carousel Banner (Media Library)</SectionHeader>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        border: "2px dashed #CBD5E1",
                        borderRadius: 3,
                        p: 2.5,
                        textAlign: "center",
                        bgcolor: "#F8FAFC",
                      }}
                    >
                      {selectedMedia ? (
                        <Box sx={{ textAlign: "center" }}>
                          <Box
                            component="img"
                            src={selectedMedia.url}
                            alt={selectedMedia.filename}
                            sx={{ maxHeight: 150, borderRadius: 2, mx: "auto", mb: 1, objectFit: "cover" }}
                          />
                          <Typography variant="caption" sx={{ display: "block", color: "success.main", fontWeight: 700, mb: 1 }}>
                            ✓ Selected from Media Library: {selectedMedia.filename}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CollectionsIcon />}
                            onClick={() => setMediaPickerOpen(true)}
                          >
                            Change Media Image
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<CollectionsIcon />}
                          onClick={() => setMediaPickerOpen(true)}
                          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                        >
                          Select Image from Media Library
                        </Button>
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <MaterialTextField name="headline" label="Banner Overlay Headline" placeholder="20% OFF ALL CAKES" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MaterialTextField name="subtext" label="Banner Overlay Subtext" placeholder="Use code CAKE20" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MaterialSelectField
                      name="linkType"
                      label="Banner Click Target"
                      options={[
                        { label: "Category Page", value: "CATEGORY" },
                        { label: "Product Detail", value: "PRODUCT" },
                        { label: "Custom URL", value: "EXTERNAL_URL" },
                      ]}
                    />
                  </Grid>

                  {values.linkType === "CATEGORY" && (
                    <Grid size={{ xs: 6 }}>
                      <MaterialSelectField
                        name="linkCategoryId"
                        label="Destination Category"
                        options={categoriesList.map((cat: any) => ({
                          label: cat.name,
                          value: cat.id,
                        }))}
                      />
                    </Grid>
                  )}

                  {values.linkType === "PRODUCT" && (
                    <Grid size={{ xs: 6 }}>
                      <MaterialSelectField
                        name="linkProductId"
                        label="Destination Product"
                        options={productsList.map((prod: any) => ({
                          label: `${prod.name} (${prod.sku})`,
                          value: prod.id,
                        }))}
                      />
                    </Grid>
                  )}

                  {values.linkType === "EXTERNAL_URL" && (
                    <Grid size={{ xs: 6 }}>
                      <MaterialTextField name="linkUrl" label="Custom Destination URL" placeholder="https://..." />
                    </Grid>
                  )}

                  <Grid size={{ xs: 6 }}>
                    <MaterialSelectField
                      name="isActive"
                      label="Status"
                      options={[
                        { label: "Active", value: true },
                        { label: "Inactive", value: false },
                      ]}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* Bottom Sticky Actions */}
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
                disabled={isSubmitting || isCreateLoading || isUpdateLoading}
                sx={{ minWidth: 100 }}
              >
                {isSubmitting || isCreateLoading || isUpdateLoading ? (
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
                disabled={isSubmitting || isCreateLoading || isUpdateLoading}
                sx={{ minWidth: 100 }}
              >
                Reset
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Media Picker Modal Component */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        allowedTypes={["image"]}
        title="Select Hero Carousel Banner Image"
      />
    </>
  );
}
