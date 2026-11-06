"use client";

import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/lib/DialogProvider";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { useModal } from "@/lib/ModalProvider";
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import {
  useCreateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/features/products/productApiService";
import { CreateProductPayload } from "@/interfaces/product.interface";

import BakeryDetailsSection from "./sections/BakeryDetailsSection";
import BasicInfoSection from "./sections/BasicInfoSection";
import CrossBrandUpsellsSection from "./sections/CrossBrandUpsellsSection";
import DietarySection from "./sections/DietarySection";
import InventorySection from "./sections/InventorySection";
import MediaGallerySection from "./sections/MediaGallerySection";
import ModifiersSection from "./sections/ModifiersSection";
import OrganizationSection from "./sections/OrganizationSection";
import PricingTaxSection from "./sections/PricingTaxSection";
import SeoSection from "./sections/SeoSection";
import VariantsSection from "./sections/VariantsSection";

// ─── Quick Jump Navigation Items ──────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  errorKeys?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: "sec-overview", label: "Overview", errorKeys: ["name", "shortDescription", "code"] },
  { id: "sec-organization", label: "Organization", errorKeys: ["brandId", "categoryId"] },
  { id: "sec-media", label: "Media & Gallery", errorKeys: ["mainImageId", "thumbnailId"] },
  { id: "sec-pricing", label: "Pricing & Tax", errorKeys: ["basePrice", "baseUnit", "gstRate", "hsnCode"] },
  { id: "sec-variants", label: "Variants", errorKeys: ["variants"] },
  { id: "sec-inventory", label: "Inventory", errorKeys: ["stockQuantity", "lowStockThreshold"] },
  { id: "sec-bakery", label: "Bakery Specs", errorKeys: ["weight", "shelfLife"] },
  { id: "sec-dietary", label: "Dietary & Nutrition", errorKeys: ["dietaryTags", "allergenInfo"] },
  { id: "sec-modifiers", label: "Modifiers", errorKeys: ["modifierGroupIds"] },
  { id: "sec-upsells", label: "Upsells", errorKeys: ["crossBrandUpsells"] },
  { id: "sec-seo", label: "SEO & Flags", errorKeys: ["seoTitle", "seoDescription"] },
];

export default function ProductForm({ onClose }: { onClose?: () => void }) {
  const theme = useTheme();
  const { showToast } = useToast();
  const { openDialog } = useConfirmDialog();
  const { closeModal, isEditing: isModalEditing } = useModal();
  const { closeDrawer, isEditing: isDrawerEditing } = useFormDrawer();

  const isEditing = isModalEditing || isDrawerEditing;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-overview");

  const selectedProduct = useSelector((state: any) => state.productReducer.selectedProduct);
  const { data: fullProductResponse } = useGetProductQuery(
    { id: selectedProduct?.id },
    { skip: !isEditing || !selectedProduct?.id }
  );
  const activeProduct = fullProductResponse?.data || selectedProduct;

  const [createProduct, { isLoading: isCreateLoading, isSuccess: isCreateSuccess, error: createError }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, error: updateError }] =
    useUpdateProductMutation();

  const handleClose = () => {
    if (onClose) onClose();
    closeModal();
    closeDrawer();
  };

  const handleSafeClose = (isDirty: boolean) => {
    if (isDirty) {
      openDialog("You have unsaved changes. Discard and close?", () => {
        handleClose();
      });
    } else {
      handleClose();
    }
  };

  const scrollToSection = (secId: string) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(secId);
    }
  };

  // Scroll-spy via IntersectionObserver
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: container,
        rootMargin: "-10% 0px -70% 0px",
        threshold: 0.1,
      }
    );

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const initialValues = {
    // ── Basic ──────────────────────────────────────────────────────────────
    name: activeProduct?.name || "",
    shortDescription: activeProduct?.shortDescription || "",
    description: activeProduct?.description || "",
    code: activeProduct?.code || "",
    categoryId: activeProduct?.categoryId || "",
    brandId: activeProduct?.brandId || "",

    // ── Pricing & Tax ──────────────────────────────────────────────────────
    baseUnit: activeProduct?.baseUnit || "piece",
    basePrice: activeProduct?.basePrice ? Number(activeProduct.basePrice) : 0,
    availableUnits: activeProduct?.availableUnits || {},
    hsnCode: activeProduct?.hsnCode || "",
    gstRate:
      activeProduct?.gstRate !== undefined &&
      activeProduct?.gstRate !== null &&
      activeProduct?.gstRate !== ""
        ? Number(activeProduct.gstRate)
        : 5,

    // ── Variants ───────────────────────────────────────────────────────────
    variants: activeProduct?.variants?.length
      ? activeProduct.variants.map((v: any, idx: number) => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          compareAtPrice:
            v.compareAtPrice !== null && v.compareAtPrice !== undefined
              ? Number(v.compareAtPrice)
              : "",
          weight:
            v.weight !== null && v.weight !== undefined ? Number(v.weight) : "",
          weightUnit: v.weightUnit || "g",
          isDefault: Boolean(v.isDefault),
          inStock: v.inStock !== false,
          stockQuantity: v.stockQuantity ?? 100,
          displayOrder: v.displayOrder ?? idx,
        }))
      : [],

    // ── Inventory ──────────────────────────────────────────────────────────
    inStock: activeProduct?.inStock ?? true,
    stockQuantity: activeProduct?.stockQuantity || 0,
    lowStockThreshold: activeProduct?.lowStockThreshold || 5,
    preorderEnabled: activeProduct?.preorderEnabled || false,
    preorderLeadDays: activeProduct?.preorderLeadDays || 2,

    // ── Bakery ─────────────────────────────────────────────────────────────
    weight: activeProduct?.weight || "",
    weightUnit: activeProduct?.weightUnit || "g",
    piecesPerPack: activeProduct?.piecesPerPack || "",
    shelfLife: activeProduct?.shelfLife || "",
    storageInstructions: activeProduct?.storageInstructions || "",

    // ── Dietary ────────────────────────────────────────────────────────────
    dietaryTags: activeProduct?.dietaryTags || [],
    allergenInfo: activeProduct?.allergenInfo || { contains: [], mayContain: [] },
    nutritionalInfo: activeProduct?.nutritionalInfo || {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      saturatedFat: "",
      fiber: "",
      sugar: "",
      sodium: "",
    },

    // ── Add-ons & Modifiers ────────────────────────────────────────────────
    modifierGroupIds:
      activeProduct?.modifierGroups?.map(
        (pmg: any) => pmg.modifierGroupId || pmg.modifierGroup?.id
      ) || [],

    // ── Cross-Brand Upsells ────────────────────────────────────────────────
    crossBrandUpsells: activeProduct?.crossBrandUpsells?.length
      ? activeProduct.crossBrandUpsells.map((u: any, idx: number) => ({
          id: u.id,
          targetProductId: u.targetProductId,
          customTitle: u.customTitle || "",
          discountPrice:
            u.discountPrice !== null && u.discountPrice !== undefined
              ? Number(u.discountPrice)
              : "",
          isActive: u.isActive !== false,
          displayOrder: u.displayOrder ?? idx,
        }))
      : [],

    // ── Media (submit IDs only) ────────────────────────────────────────────
    mainImageId: activeProduct?.mainImageId || "",
    thumbnailId: activeProduct?.thumbnailId || "",
    gallery:
      activeProduct?.gallery?.map((m: any) =>
        typeof m === "string" ? m : m.id
      ) || [],

    // UI-only preview URLs
    _mainImageUrl: activeProduct?.mainImage?.url || "",
    _thumbnailUrl: activeProduct?.thumbnail?.url || "",

    // ── Promotions ─────────────────────────────────────────────────────────
    featured: activeProduct?.featured || false,
    bestSeller: activeProduct?.bestSeller || false,
    newArrival: activeProduct?.newArrival || false,

    // ── Seasonal ───────────────────────────────────────────────────────────
    isSeasonal: activeProduct?.isSeasonal || false,
    availableFrom: activeProduct?.availableFrom
      ? new Date(activeProduct.availableFrom).toISOString().split("T")[0]
      : "",
    availableUntil: activeProduct?.availableUntil
      ? new Date(activeProduct.availableUntil).toISOString().split("T")[0]
      : "",
    maxPerOrder: activeProduct?.maxPerOrder || "",

    // ── SEO ────────────────────────────────────────────────────────────────
    seoTitle: activeProduct?.seoTitle || "",
    seoDescription: activeProduct?.seoDescription || "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const { _mainImageUrl, _thumbnailUrl, ...rest } = values;

      const formattedVariants = (rest.variants || [])
        .filter((v: any) => v.name && v.name.trim() !== "")
        .map((v: any, idx: number) => ({
          ...(v.id ? { id: v.id } : {}),
          name: v.name.trim(),
          price: Number(v.price || 0),
          compareAtPrice:
            v.compareAtPrice !== "" && v.compareAtPrice !== null && v.compareAtPrice !== undefined
              ? Number(v.compareAtPrice)
              : undefined,
          weight:
            v.weight !== "" && v.weight !== null && v.weight !== undefined
              ? Number(v.weight)
              : undefined,
          weightUnit: v.weightUnit || undefined,
          isDefault: Boolean(v.isDefault),
          inStock: v.inStock !== false,
          stockQuantity: Number(v.stockQuantity || 0),
          displayOrder: idx,
        }));

      const formattedUpsells = (rest.crossBrandUpsells || [])
        .filter((u: any) => u.targetProductId && u.targetProductId.trim() !== "")
        .map((u: any, idx: number) => ({
          ...(u.id ? { id: u.id } : {}),
          targetProductId: u.targetProductId,
          customTitle: u.customTitle ? u.customTitle.trim() : undefined,
          discountPrice:
            u.discountPrice !== "" && u.discountPrice !== null && u.discountPrice !== undefined
              ? Number(u.discountPrice)
              : undefined,
          isActive: u.isActive !== false,
          displayOrder: idx,
        }));

      const payload = {
        ...rest,
        gstRate:
          rest.gstRate !== undefined && rest.gstRate !== null && rest.gstRate !== ""
            ? Number(rest.gstRate)
            : 5,
        weight: rest.weight !== "" ? Number(rest.weight) : undefined,
        piecesPerPack: rest.piecesPerPack !== "" ? Number(rest.piecesPerPack) : undefined,
        shelfLife: rest.shelfLife !== "" ? Number(rest.shelfLife) : undefined,
        maxPerOrder: rest.maxPerOrder !== "" ? Number(rest.maxPerOrder) : undefined,
        hsnCode: rest.hsnCode || undefined,
        code: rest.code || undefined,
        seoTitle: rest.seoTitle || undefined,
        seoDescription: rest.seoDescription || undefined,
        availableFrom: rest.availableFrom || undefined,
        availableUntil: rest.availableUntil || undefined,
        mainImageId: rest.mainImageId || undefined,
        thumbnailId: rest.thumbnailId || undefined,
        description: rest.description || undefined,
        storageInstructions: rest.storageInstructions || undefined,
        variants: formattedVariants,
        modifierGroupIds: rest.modifierGroupIds || [],
        crossBrandUpsells: formattedUpsells,
      };

      if (isEditing && selectedProduct?.id) {
        await updateProduct({ id: selectedProduct.id, body: payload });
      } else {
        await createProduct(payload as CreateProductPayload);
      }
    } catch (error) {
      console.error("Product submit error:", error);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Product created successfully!", "success");
      handleClose();
    }
    if (isUpdateSuccess) {
      showToast("Product updated successfully!", "success");
      handleClose();
    }
    if (createError) {
      showToast((createError as any)?.data?.message || "Failed to create product", "error");
    }
    if (updateError) {
      showToast((updateError as any)?.data?.message || "Failed to update product", "error");
    }
  }, [isCreateSuccess, isUpdateSuccess, createError, updateError]);

  const isLoading = isCreateLoading || isUpdateLoading;

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, submitForm, dirty, errors }) => (
        <Form style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* ── Sticky Top Action Bar ────────────────────────────────────────── */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "background.paper",
              zIndex: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {isEditing ? `Edit Product: ${activeProduct?.name || ""}` : "Create New Product"}
              </Typography>
              {isEditing && (
                <Chip
                  label={activeProduct?.isActive !== false ? "Active" : "Inactive"}
                  color={activeProduct?.isActive !== false ? "success" : "default"}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleSafeClose(dirty)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={submitForm}
                disabled={isSubmitting || isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                }
                sx={{ px: 3, fontWeight: 600 }}
              >
                {isEditing ? "Save Changes" : "Create Product"}
              </Button>

              <IconButton
                size="small"
                onClick={() => handleSafeClose(dirty)}
                sx={{ ml: 1, color: "text.secondary" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* ── Sticky Quick-Jump Pill Bar ──────────────────────────────────── */}
          <Box
            sx={{
              px: 3,
              py: 1,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: theme.palette.mode === "dark" ? "background.paper" : "grey.50",
              display: "flex",
              gap: 1,
              overflowX: "auto",
              whiteSpace: "nowrap",
              zIndex: 9,
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
            }}
          >
            {NAV_ITEMS.map((item) => {
              const hasError = item.errorKeys?.some((k) => Boolean((errors as any)[k]));
              const isActive = activeSection === item.id;

              return (
                <Chip
                  key={item.id}
                  label={hasError ? `${item.label} ⚠️` : item.label}
                  onClick={() => scrollToSection(item.id)}
                  color={hasError ? "error" : isActive ? "primary" : "default"}
                  variant={isActive ? "filled" : "outlined"}
                  size="small"
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: isActive ? undefined : "action.hover",
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* ── Scrollable 2-Column Canvas ──────────────────────────────────── */}
          <Box
            ref={scrollContainerRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              p: { xs: 2, md: 3 },
              bgcolor: theme.palette.mode === "dark" ? "background.default" : "grey.100",
            }}
          >
            <Grid container spacing={3}>
              {/* ── Left Main Column (65% width) ────────────────────────────── */}
              <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <BasicInfoSection />
                <MediaGallerySection />
                <PricingTaxSection />
                <VariantsSection />
                <ModifiersSection />
                <CrossBrandUpsellsSection currentProductId={activeProduct?.id} />
              </Grid>

              {/* ── Right Rail Column (35% width) ───────────────────────────── */}
              <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <OrganizationSection />
                <InventorySection />
                <BakeryDetailsSection />
                <DietarySection />
                <SeoSection />
              </Grid>
            </Grid>

            {/* ── Bottom Save Callout ───────────────────────────────────────── */}
            <Box
              sx={{
                mt: 4,
                mb: 2,
                p: 2.5,
                borderRadius: 2,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {dirty ? "You have unsaved changes." : "All fields up to date."}
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => handleSafeClose(dirty)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={submitForm}
                  disabled={isSubmitting || isLoading}
                  startIcon={
                    isLoading ? <CircularProgress size={14} color="inherit" /> : <SaveIcon fontSize="small" />
                  }
                >
                  {isEditing ? "Save Changes" : "Create Product"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
}
