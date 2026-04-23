"use client";

import MediaPickerModal, { MediaItem } from "@/components/ui/Media/MediaPickerModal";
import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { Add, Close as CloseIcon, Image as ImageIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import { Field, Form, Formik, useField } from "formik";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import { useGetAllCategoriesQuery } from "@/features/categories/categoriesApiService";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/features/products/productApiService";
import { CreateProductPayload } from "@/interfaces/product.interface";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  "Basic Info",
  "Pricing & Tax",
  "Inventory",
  "Bakery Details",
  "Dietary & Allergens",
  "Media",
  "SEO & Promotions",
];

const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "gluten_free",
  "dairy_free",
  "nut_free",
  "sugar_free",
  "egg_free",
  "halal",
  "kosher",
];

const COMMON_ALLERGENS = [
  "wheat",
  "eggs",
  "milk",
  "soy",
  "nuts",
  "peanuts",
  "fish",
  "shellfish",
  "sesame",
];

const PRODUCT_UNITS = [
  { value: "piece", label: "Piece" },
  { value: "dozen", label: "Dozen" },
  { value: "half_dozen", label: "Half Dozen" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "loaf", label: "Loaf" },
  { value: "box", label: "Box" },
  { value: "tray", label: "Tray" },
  { value: "slice", label: "Slice" },
];

const GST_RATES = [
  { value: 0, label: "0% (Exempt)" },
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
  { value: 40, label: "40%" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      <Typography variant="subtitle2" sx={{ color: theme.palette.primary.contrastText, fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
};

const DietaryTagsInput = ({ name }: { name: string }) => {
  const [field, , helpers] = useField(name);
  const value: string[] = field.value || [];
  const toggle = (tag: string) => {
    if (value.includes(tag)) helpers.setValue(value.filter((t) => t !== tag));
    else helpers.setValue([...value, tag]);
  };
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
        Select applicable dietary tags
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {DIETARY_OPTIONS.map((opt) => (
          <Chip
            key={opt}
            label={opt.replace(/_/g, " ").toUpperCase()}
            onClick={() => toggle(opt)}
            color={value.includes(opt) ? "success" : "default"}
            variant={value.includes(opt) ? "filled" : "outlined"}
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

const AllergenInfoInput = ({ name }: { name: string }) => {
  const [field, , helpers] = useField(name);
  const value = field.value || { contains: [], mayContain: [] };
  const toggle = (section: "contains" | "mayContain", allergen: string) => {
    const list: string[] = value[section] || [];
    const updated = list.includes(allergen)
      ? list.filter((a) => a !== allergen)
      : [...list, allergen];
    helpers.setValue({ ...value, [section]: updated });
  };
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        Contains (definitely present)
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {COMMON_ALLERGENS.map((a) => (
          <Chip
            key={a}
            label={a}
            onClick={() => toggle("contains", a)}
            color={(value.contains || []).includes(a) ? "error" : "default"}
            variant={(value.contains || []).includes(a) ? "filled" : "outlined"}
            size="small"
          />
        ))}
      </Box>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        May Contain (traces possible)
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {COMMON_ALLERGENS.map((a) => (
          <Chip
            key={a}
            label={a}
            onClick={() => toggle("mayContain", a)}
            color={(value.mayContain || []).includes(a) ? "warning" : "default"}
            variant={(value.mayContain || []).includes(a) ? "filled" : "outlined"}
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

const NutritionalInfoInput = () => (
  <Grid container spacing={2}>
    {[
      { name: "nutritionalInfo.calories", label: "Calories (kcal)" },
      { name: "nutritionalInfo.protein", label: "Protein (g)" },
      { name: "nutritionalInfo.carbs", label: "Carbohydrates (g)" },
      { name: "nutritionalInfo.fat", label: "Total Fat (g)" },
      { name: "nutritionalInfo.saturatedFat", label: "Saturated Fat (g)" },
      { name: "nutritionalInfo.fiber", label: "Dietary Fiber (g)" },
      { name: "nutritionalInfo.sugar", label: "Sugar (g)" },
      { name: "nutritionalInfo.sodium", label: "Sodium (mg)" },
    ].map(({ name, label }) => (
      <Grid item xs={6} sm={3} key={name}>
        <MaterialTextField name={name} label={label} type="number" fullWidth size="small" />
      </Grid>
    ))}
  </Grid>
);

const AvailableUnitsInput = ({ name }: { name: string }) => {
  const [field, , helpers] = useField(name);
  const value: Record<string, number> = field.value || {};
  const [unit, setUnit] = useState("");
  const [qty, setQty] = useState("");

  const addUnit = () => {
    if (!unit || !qty) return;
    helpers.setValue({ ...value, [unit]: Number(qty) });
    setUnit("");
    setQty("");
  };

  const removeUnit = (key: string) => {
    const { [key]: _, ...rest } = value;
    helpers.setValue(rest);
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        Define additional purchasable units and their equivalent base quantity
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Unit Name"
          size="small"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g. dozen"
          sx={{ flex: 1, minWidth: 120 }}
        />
        <TextField
          label="Qty / Price Multiplier"
          size="small"
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="e.g. 12"
          sx={{ flex: 1, minWidth: 100 }}
        />
        <Button variant="contained" size="small" onClick={addUnit} startIcon={<Add />}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {Object.entries(value).map(([key, val]) => (
          <Chip
            key={key}
            label={`${key} = ${val}`}
            onDelete={() => removeUnit(key)}
            color="primary"
            variant="outlined"
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

const GalleryPickerInput = ({ name }: { name: string }) => {
  const [field, , helpers] = useField(name);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);

  const handleSelect = (selected: MediaItem | MediaItem[]) => {
    const items = Array.isArray(selected) ? selected : [selected];
    const merged = [
      ...galleryItems,
      ...items.filter((m) => !galleryItems.find((g) => g.id === m.id)),
    ];
    setGalleryItems(merged);
    helpers.setValue(merged.map((m) => m.id));
    setPickerOpen(false);
  };

  const removeItem = (id: string) => {
    const updated = galleryItems.filter((m) => m.id !== id);
    setGalleryItems(updated);
    helpers.setValue(updated.map((m) => m.id));
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<ImageIcon />}
        onClick={() => setPickerOpen(true)}
        size="small"
        sx={{ mb: 2 }}
      >
        Add Gallery Images
      </Button>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {galleryItems.map((item) => (
          <Box
            key={item.id}
            sx={{
              position: "relative",
              width: 80,
              height: 80,
              borderRadius: 1.5,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              component="img"
              src={item.thumbnailUrl || item.url}
              alt={item.filename}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <IconButton
              size="small"
              onClick={() => removeItem(item.id)}
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                bgcolor: "rgba(0,0,0,0.6)",
                color: "white",
                p: 0.25,
                "&:hover": { bgcolor: "error.main" },
              }}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        ))}
      </Box>
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        multiple
        allowedTypes={["image"]}
        title="Select Gallery Images"
      />
    </Box>
  );
};

const SingleImagePicker = ({
  idField,
  urlField,
  label,
  helperText,
}: {
  idField: string;
  urlField: string;
  label: string;
  helperText?: string;
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <Field name={idField}>
      {({ field, form }: any) => (
        <Box>
          {helperText && (
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {helperText}
            </Typography>
          )}
          {field.value && (
            <Box
              sx={{
                mb: 1.5,
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
                src={form.values[urlField] || ""}
                alt={label}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <IconButton
                size="small"
                onClick={() => {
                  form.setFieldValue(idField, "");
                  form.setFieldValue(urlField, "");
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
            {field.value ? `Change ${label}` : `Select ${label}`}
          </Button>
          <MediaPickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            allowedTypes={["image"]}
            title={`Select ${label}`}
            onSelect={(media) => {
              const m = media as MediaItem;
              form.setFieldValue(idField, m.id);
              form.setFieldValue(urlField, m.url);
              setPickerOpen(false);
            }}
          />
        </Box>
      )}
    </Field>
  );
};

// ─── Step Content ─────────────────────────────────────────────────────────────

const renderStep = (step: number, values: any, handleChange: any, categoriesData: any) => {
  switch (step) {
    // ── Step 0: Basic Info ───────────────────────────────────────────────────
    case 0:
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Alert severity="info">Provide the core product identity and classification.</Alert>
          </Grid>
          <Grid item xs={12}>
            <MaterialTextField name="name" label="Product Name *" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <MaterialTextField
              name="shortDescription"
              label="Short Description *"
              multiline
              rows={2}
              fullWidth
              helperText="Shown in product cards — max 200 characters"
            />
          </Grid>
          <Grid item xs={12}>
            <MaterialTextField
              name="description"
              label="Full Description"
              multiline
              rows={4}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <MaterialTextField
              name="code"
              label="Product Code"
              fullWidth
              helperText="Max 5 chars — used for SKU prefix generation"
              inputProps={{ maxLength: 5 }}
            />
          </Grid>
          <Grid item xs={6}>
            <MaterialSelectField
              name="categoryId"
              label="Category *"
              options={
                categoriesData?.data?.map((cat: any) => ({
                  value: cat.id,
                  label: cat.name,
                })) || []
              }
              fullWidth
            />
          </Grid>
        </Grid>
      );

    // ── Step 1: Pricing & Tax ────────────────────────────────────────────────
    case 1:
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Alert severity="info">Configure pricing, GST classification, and purchasable units.</Alert>
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>Base Pricing</SectionHeader>
          </Grid>
          <Grid item xs={6}>
            <MaterialSelectField
              name="baseUnit"
              label="Base Unit *"
              options={PRODUCT_UNITS}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <MaterialTextField
              name="basePrice"
              label="Base Price (₹) *"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>Tax Details</SectionHeader>
          </Grid>
          <Grid item xs={6}>
            <MaterialTextField
              name="hsnCode"
              label="HSN Code"
              fullWidth
              helperText="Harmonized System Nomenclature code for GST filing"
            />
          </Grid>
          <Grid item xs={6}>
            <MaterialSelectField
              name="gstRate"
              label="GST Rate *"
              options={GST_RATES.map((r) => ({ value: r.value, label: r.label }))}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>Available Units</SectionHeader>
            <AvailableUnitsInput name="availableUnits" />
          </Grid>
        </Grid>
      );

    // ── Step 2: Inventory ────────────────────────────────────────────────────
    case 2:
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Alert severity="info">Manage stock levels and pre-order settings.</Alert>
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>Stock</SectionHeader>
          </Grid>
          <Grid item xs={6}>
            <MaterialTextField
              name="stockQuantity"
              label="Stock Quantity"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={6}>
            <MaterialTextField
              name="lowStockThreshold"
              label="Low Stock Alert Threshold"
              type="number"
              fullWidth
              helperText="Alert fires when quantity falls below this number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox name="inStock" checked={values.inStock} onChange={handleChange} />}
              label="Currently In Stock"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>Pre-order</SectionHeader>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="preorderEnabled"
                  checked={values.preorderEnabled}
                  onChange={handleChange}
                />
              }
              label="Enable Pre-orders"
            />
          </Grid>
          {values.preorderEnabled && (
            <Grid item xs={6}>
              <MaterialTextField
                name="preorderLeadDays"
                label="Pre-order Lead Days"
                type="number"
                fullWidth
                helperText="Days required before the order can be fulfilled"
                inputProps={{ min: 1 }}
              />
            </Grid>
          )}
        </Grid>
      );

    // ── Step 3: Bakery Details ───────────────────────────────────────────────
    case 3:
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Alert severity="info">Physical attributes and storage guidance.</Alert>
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>Weight & Packaging</SectionHeader>
          </Grid>
          <Grid item xs={6}>
            <MaterialTextField
              name="weight"
              label="Weight"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>
          <Grid item xs={6}>
            <MaterialSelectField
              name="weightUnit"
              label="Weight Unit"
              options={[
                { value: "g", label: "Grams (g)" },
                { value: "kg", label: "Kilograms (kg)" },
                { value: "oz", label: "Ounces (oz)" },
                { value: "lb", label: "Pounds (lb)" },
              ]}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <MaterialTextField
              name="piecesPerPack"
              label="Pieces Per Pack"
              type="number"
              fullWidth
              helperText="How many individual pieces come in one pack"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <MaterialTextField
              name="shelfLife"
              label="Shelf Life (days)"
              type="number"
              fullWidth
              helperText="How many days this product remains fresh"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12}>
            <MaterialTextField
              name="storageInstructions"
              label="Storage Instructions"
              multiline
              rows={3}
              fullWidth
              placeholder="e.g. Store in a cool, dry place. Refrigerate after opening."
            />
          </Grid>
        </Grid>
      );

    // ── Step 4: Dietary & Allergens ──────────────────────────────────────────
    case 4:
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info">Dietary status, allergen info, and nutritional breakdown.</Alert>
          </Grid>
          <Grid item xs={12}>
            <SectionHeader>Dietary Tags</SectionHeader>
            <DietaryTagsInput name="dietaryTags" />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <SectionHeader>Allergen Information</SectionHeader>
            <AllergenInfoInput name="allergenInfo" />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <SectionHeader>Nutritional Information (per serving)</SectionHeader>
            <NutritionalInfoInput />
          </Grid>
        </Grid>
      );

    // ── Step 5: Media ────────────────────────────────────────────────────────
    case 5:
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info">Select images from your media library.</Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionHeader>Main Image</SectionHeader>
            <SingleImagePicker
              idField="mainImageId"
              urlField="_mainImageUrl"
              label="Main Image"
              helperText="Primary product photo shown on the product detail page"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionHeader>Thumbnail</SectionHeader>
            <SingleImagePicker
              idField="thumbnailId"
              urlField="_thumbnailUrl"
              label="Thumbnail"
              helperText="Smaller image used in listing cards (falls back to main image)"
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <SectionHeader>Gallery</SectionHeader>
            <GalleryPickerInput name="gallery" />
          </Grid>
        </Grid>
      );

    // ── Step 6: SEO & Promotions ─────────────────────────────────────────────
    case 6:
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Alert severity="info">SEO metadata, promotional flags, and seasonal availability.</Alert>
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>SEO</SectionHeader>
          </Grid>
          <Grid item xs={12}>
            <MaterialTextField
              name="seoTitle"
              label="SEO Title"
              fullWidth
              helperText="Leave empty to use product name"
            />
          </Grid>
          <Grid item xs={12}>
            <MaterialTextField
              name="seoDescription"
              label="SEO Description"
              multiline
              rows={2}
              fullWidth
              helperText="Meta description for search engines (150–160 chars recommended)"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>Promotional Flags</SectionHeader>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Tooltip title="Show in featured product carousels">
              <FormControlLabel
                control={
                  <Checkbox name="featured" checked={values.featured} onChange={handleChange} />
                }
                label="Featured"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Tooltip title="Show in best seller sections">
              <FormControlLabel
                control={
                  <Checkbox
                    name="bestSeller"
                    checked={values.bestSeller}
                    onChange={handleChange}
                  />
                }
                label="Best Seller"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Tooltip title="Show in new arrivals">
              <FormControlLabel
                control={
                  <Checkbox
                    name="newArrival"
                    checked={values.newArrival}
                    onChange={handleChange}
                  />
                }
                label="New Arrival"
              />
            </Tooltip>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <SectionHeader>Seasonal Availability</SectionHeader>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="isSeasonal"
                  checked={values.isSeasonal}
                  onChange={handleChange}
                />
              }
              label="Seasonal Product — restrict availability to a date range"
            />
          </Grid>
          {values.isSeasonal && (
            <>
              <Grid item xs={6}>
                <MaterialTextField
                  name="availableFrom"
                  label="Available From"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <MaterialTextField
                  name="availableUntil"
                  label="Available Until"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={6}>
            <MaterialTextField
              name="maxPerOrder"
              label="Maximum Per Order"
              type="number"
              fullWidth
              helperText="Leave empty for no per-order limit"
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      );

    default:
      return null;
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductForm() {
  const { closeDrawer, isEditing } = useFormDrawer();
  const { showToast } = useToast();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const selectedProduct = useSelector((state: any) => state.productReducer.selectedProduct);
  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 10000, page: 1 });

  const [createProduct, { isLoading: isCreateLoading, isSuccess: isCreateSuccess, error: createError }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, error: updateError }] =
    useUpdateProductMutation();

  // All fields map 1:1 with CreateProductDto.
  // _mainImageUrl / _thumbnailUrl are UI-only for image previews — stripped before submit.
  const initialValues = {
    // ── Basic ──────────────────────────────────────────────────────────────
    name: selectedProduct?.name || "",
    shortDescription: selectedProduct?.shortDescription || "",
    description: selectedProduct?.description || "",
    code: selectedProduct?.code || "",
    categoryId: selectedProduct?.categoryId || "",

    // ── Pricing & Tax ──────────────────────────────────────────────────────
    baseUnit: selectedProduct?.baseUnit || "piece",
    basePrice: selectedProduct?.basePrice || 0,
    availableUnits: selectedProduct?.availableUnits || {},
    hsnCode: selectedProduct?.hsnCode || "",
    gstRate: selectedProduct?.gstRate ?? 5,

    // ── Inventory ──────────────────────────────────────────────────────────
    inStock: selectedProduct?.inStock ?? true,
    stockQuantity: selectedProduct?.stockQuantity || 0,
    lowStockThreshold: selectedProduct?.lowStockThreshold || 5,
    preorderEnabled: selectedProduct?.preorderEnabled || false,
    preorderLeadDays: selectedProduct?.preorderLeadDays || 2,

    // ── Bakery ─────────────────────────────────────────────────────────────
    weight: selectedProduct?.weight || "",
    weightUnit: selectedProduct?.weightUnit || "g",
    piecesPerPack: selectedProduct?.piecesPerPack || "",
    shelfLife: selectedProduct?.shelfLife || "",
    storageInstructions: selectedProduct?.storageInstructions || "",

    // ── Dietary ────────────────────────────────────────────────────────────
    dietaryTags: selectedProduct?.dietaryTags || [],
    allergenInfo: selectedProduct?.allergenInfo || { contains: [], mayContain: [] },
    nutritionalInfo: selectedProduct?.nutritionalInfo || {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      saturatedFat: "",
      fiber: "",
      sugar: "",
      sodium: "",
    },

    // ── Media (submit IDs only) ────────────────────────────────────────────
    mainImageId: selectedProduct?.mainImageId || "",
    thumbnailId: selectedProduct?.thumbnailId || "",
    gallery:
      selectedProduct?.gallery?.map((m: any) => (typeof m === "string" ? m : m.id)) || [],

    // UI-only preview URLs — NOT sent to API
    _mainImageUrl: selectedProduct?.mainImage?.url || "",
    _thumbnailUrl: selectedProduct?.thumbnail?.url || "",

    // ── Promotions ─────────────────────────────────────────────────────────
    featured: selectedProduct?.featured || false,
    bestSeller: selectedProduct?.bestSeller || false,
    newArrival: selectedProduct?.newArrival || false,

    // ── Seasonal ───────────────────────────────────────────────────────────
    isSeasonal: selectedProduct?.isSeasonal || false,
    availableFrom: selectedProduct?.availableFrom
      ? new Date(selectedProduct.availableFrom).toISOString().split("T")[0]
      : "",
    availableUntil: selectedProduct?.availableUntil
      ? new Date(selectedProduct.availableUntil).toISOString().split("T")[0]
      : "",
    maxPerOrder: selectedProduct?.maxPerOrder || "",

    // ── SEO ────────────────────────────────────────────────────────────────
    seoTitle: selectedProduct?.seoTitle || "",
    seoDescription: selectedProduct?.seoDescription || "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      // Strip UI-only preview URL fields
      const { _mainImageUrl, _thumbnailUrl, ...rest } = values;

      // Coerce empty strings to undefined for optional numeric fields
      const payload = {
        ...rest,
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
      };

      if (isEditing) {
        await updateProduct({ id: selectedProduct.id, body: payload });
      } else {
        await createProduct(payload as CreateProductPayload);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      showToast("Product created successfully!", "success");
      closeDrawer();
    }
    if (isUpdateSuccess) {
      showToast("Product updated successfully!", "success");
      closeDrawer();
    }
    if (createError)
      showToast((createError as any)?.data?.message || "Failed to create product", "error");
    if (updateError)
      showToast((updateError as any)?.data?.message || "Failed to update product", "error");
  }, [isCreateSuccess, isUpdateSuccess, createError, updateError]);

  const isLoading = isCreateLoading || isUpdateLoading;

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      // validationSchema={ProductValidator.createProductSchema}
      enableReinitialize
    >
      {({ isSubmitting, submitForm, values, handleChange }) => (
        <Form className="flex flex-col" style={{ height: "100%" }}>
          {/* ── Stepper Header ─────────────────────────────────────────────── */}
          <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider", overflowX: "auto" }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* ── Scrollable Content ──────────────────────────────────────────── */}
          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
              {renderStep(activeStep, values, handleChange, categoriesData)}
            </Paper>
          </Box>

          {/* ── Fixed Footer ────────────────────────────────────────────────── */}
          <Box
            sx={{
              borderTop: 1,
              borderColor: "divider",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: theme.palette.background.paper,
              position: "sticky",
              bottom: 0,
              zIndex: 1,
            }}
          >
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((s) => s - 1)}
            >
              Back
            </Button>

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">
                Step {activeStep + 1} of {STEPS.length}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  if (window.confirm("Discard unsaved changes?")) closeDrawer();
                }}
              >
                Cancel
              </Button>

              {activeStep === STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={submitForm}
                  disabled={isSubmitting || isLoading}
                  startIcon={
                    isLoading ? <CircularProgress size={18} color="inherit" /> : null
                  }
                >
                  {isEditing ? "Update Product" : "Create Product"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep((s) => s + 1)}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
}