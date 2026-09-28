"use client";

import ImageSpecHint from "@/components/common/ImageSpecHint";
import MediaPickerModal, { MediaItem } from "@/components/ui/Media/MediaPickerModal";
import type { ImageSlotName } from "@aimk/image-spec";
import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import { Add, Close as CloseIcon, Delete as DeleteIcon, Image as ImageIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import { Field, FieldArray, Form, Formik, useField } from "formik";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import { useGetAllCategoriesQuery } from "@/features/categories/categoriesApiService";
import {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/features/products/productApiService";
import { useGetModifiersQuery } from "@/features/modifiers/modifierApiService";
import { CreateProductPayload } from "@/interfaces/product.interface";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import SectionHeader from "@/components/common/SectionHeader";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  "Basic Info",
  "Pricing & Tax",
  "Variants",
  "Inventory",
  "Bakery Details",
  "Dietary & Allergens",
  "Add-ons & Modifiers",
  "Cross-Brand Upsells",
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
      <Grid size={{ xs: 6, sm: 3 }} key={name}>
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
      <Box sx={{ mb: 1.5 }}>
        <ImageSpecHint slot="productGallery" />
      </Box>
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
        slot="productGallery"
      />
    </Box>
  );
};

const SingleImagePicker = ({
  idField,
  urlField,
  label,
  helperText,
  slot,
}: {
  idField: string;
  urlField: string;
  label: string;
  helperText?: string;
  /** Image slot from @aimk/image-spec; shows requirements + advisory warnings. */
  slot?: ImageSlotName;
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  // Dimensions of the currently selected media, captured on select so the
  // requirements panel can warn about resolution/ratio without a refetch.
  const [selectedDims, setSelectedDims] = useState<
    { width?: number | null; height?: number | null } | null
  >(null);
  return (
    <Field name={idField}>
      {({ field, form }: any) => (
        <Box>
          {helperText && (
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {helperText}
            </Typography>
          )}
          {slot && (
            <Box sx={{ mb: 1.5 }}>
              <ImageSpecHint slot={slot} dimensions={field.value ? selectedDims : null} />
            </Box>
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
            slot={slot}
            onSelect={(media) => {
              const m = media as MediaItem;
              form.setFieldValue(idField, m.id);
              form.setFieldValue(urlField, m.url);
              setSelectedDims({ width: m.width, height: m.height });
              setPickerOpen(false);
            }}
          />
        </Box>
      )}
    </Field>
  );
};

const VariantsStepInput = ({ values, setFieldValue, handleChange }: any) => {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2.5 }}>
        Variants represent purchasable portion sizes (e.g. 500g, 1kg, 6-Pack). If no variants are added, this product will be purchased at the Base Price (₹{values.basePrice || 0}).
      </Alert>

      <FieldArray name="variants">
        {({ push, remove }) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {values.variants?.map((v: any, index: number) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  position: "relative",
                  border: v.isDefault ? "2px solid" : "1px solid",
                  borderColor: v.isDefault ? "primary.main" : "divider",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Variant #{index + 1}: {v.name || "Untitled"}
                    </Typography>
                    {v.isDefault && (
                      <Chip label="Default Size" color="primary" size="small" />
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => remove(index)}
                    title="Remove Variant"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Variant Name *"
                      size="small"
                      fullWidth
                      name={`variants.${index}.name`}
                      value={v.name}
                      onChange={handleChange}
                      placeholder="e.g. 500g / 1kg / Box of 4"
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Price (₹) *"
                      type="number"
                      size="small"
                      fullWidth
                      name={`variants.${index}.price`}
                      value={v.price}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="MRP / Compare Price (₹)"
                      type="number"
                      size="small"
                      fullWidth
                      name={`variants.${index}.compareAtPrice`}
                      value={v.compareAtPrice}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Portion Weight"
                      type="number"
                      size="small"
                      fullWidth
                      name={`variants.${index}.weight`}
                      value={v.weight}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Unit"
                      size="small"
                      fullWidth
                      name={`variants.${index}.weightUnit`}
                      value={v.weightUnit}
                      onChange={handleChange}
                      placeholder="e.g. g, kg, pcs"
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Stock Qty"
                      type="number"
                      size="small"
                      fullWidth
                      name={`variants.${index}.stockQuantity`}
                      value={v.stockQuantity}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={v.inStock !== false}
                          onChange={(e) =>
                            setFieldValue(`variants.${index}.inStock`, e.target.checked)
                          }
                        />
                      }
                      label={<Typography variant="caption">In Stock</Typography>}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(v.isDefault)}
                          onChange={() => {
                            values.variants.forEach((_: any, i: number) => {
                              setFieldValue(`variants.${i}.isDefault`, i === index);
                            });
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Make this the default selected size on the storefront
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() =>
                push({
                  name: "",
                  price: values.basePrice || 0,
                  compareAtPrice: "",
                  weight: values.weight || "",
                  weightUnit: values.weightUnit || "g",
                  isDefault: (values.variants?.length || 0) === 0,
                  inStock: true,
                  stockQuantity: 100,
                  displayOrder: values.variants?.length || 0,
                })
              }
              sx={{ alignSelf: "flex-start" }}
            >
              + Add Product Variant
            </Button>
          </Box>
        )}
      </FieldArray>
    </Box>
  );
};

const ModifiersStepInput = ({ values, setFieldValue }: any) => {
  const { data: modifierGroupsData, isLoading } = useGetModifiersQuery();
  const groups = modifierGroupsData?.data || [];
  const selectedIds: string[] = values.modifierGroupIds || [];

  const toggleGroup = (id: string) => {
    if (selectedIds.includes(id)) {
      setFieldValue(
        "modifierGroupIds",
        selectedIds.filter((groupId) => groupId !== id)
      );
    } else {
      setFieldValue("modifierGroupIds", [...selectedIds, id]);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2.5 }}>
        Attach modifier groups to this product. When customers click &quot;Add&quot; or &quot;Customize&quot;, these options will pop up as EatSure-style customization sheets.
      </Alert>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : groups.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No modifier groups created yet.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.open("/admin/modifiers", "_blank")}
          >
            Create Modifier Groups in Modifiers Library ↗
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {groups.map((group) => {
            const isSelected = selectedIds.includes(group.id);
            return (
              <Card
                key={group.id}
                variant="outlined"
                onClick={() => toggleGroup(group.id)}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderRadius: 2,
                  border: isSelected ? "2px solid" : "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected ? "action.hover" : "background.paper",
                  transition: "all 0.2s ease",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleGroup(group.id)}
                    sx={{ p: 0.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {group.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={group.minSelections > 0 || group.isRequired ? "Required" : "Optional"}
                        color={group.minSelections > 0 || group.isRequired ? "error" : "default"}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={group.maxSelections === 1 ? "Single Choice" : `Up to ${group.maxSelections}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Storefront Title: &quot;{group.displayName}&quot;
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                      {group.options?.map((opt: any) => (
                        <Chip
                          key={opt.id}
                          size="small"
                          label={`${opt.name} ${Number(opt.price) > 0 ? `(+₹${opt.price})` : "(Free)"}`}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

const CrossBrandUpsellsStepInput = ({ values, handleChange, setFieldValue, currentProductId }: any) => {
  const { data: productsData } = useGetAllProductsQuery({ isActive: true });
  const allProducts = (productsData?.data || []).filter((p: any) => p.id !== currentProductId);

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2.5 }}>
        EatSure-style Cross-Brand Upsells: Suggest complementary items from any brand (e.g. recommend a Nirula&apos;s Hot Fudge Sundae alongside an AIMK Cake) on the customization bottom sheet or cart drawer with an optional special bundle discount.
      </Alert>

      <FieldArray name="crossBrandUpsells">
        {({ push, remove }) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {values.crossBrandUpsells?.map((upsell: any, index: number) => (
              <Card
                key={index}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Cross-Brand Upsell #{index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => remove(index)}
                    title="Remove Upsell"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Target Product *</InputLabel>
                      <Select
                        name={`crossBrandUpsells.${index}.targetProductId`}
                        value={upsell.targetProductId || ""}
                        label="Target Product *"
                        onChange={handleChange}
                      >
                        {allProducts.map((prod: any) => (
                          <MenuItem key={prod.id} value={prod.id}>
                            {prod.name} (₹{prod.basePrice})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Custom Promotional Title"
                      size="small"
                      fullWidth
                      name={`crossBrandUpsells.${index}.customTitle`}
                      value={upsell.customTitle}
                      onChange={handleChange}
                      placeholder="e.g. Complete your celebration with Hot Fudge!"
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <TextField
                      label="Bundle Price (₹)"
                      type="number"
                      size="small"
                      fullWidth
                      name={`crossBrandUpsells.${index}.discountPrice`}
                      value={upsell.discountPrice}
                      onChange={handleChange}
                      helperText="Leave empty to use target item's regular price"
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={upsell.isActive !== false}
                          onChange={(e) =>
                            setFieldValue(`crossBrandUpsells.${index}.isActive`, e.target.checked)
                          }
                        />
                      }
                      label={<Typography variant="caption">Active</Typography>}
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() =>
                push({
                  targetProductId: "",
                  customTitle: "",
                  discountPrice: "",
                  isActive: true,
                  displayOrder: values.crossBrandUpsells?.length || 0,
                })
              }
              sx={{ alignSelf: "flex-start" }}
            >
              + Add Cross-Brand Upsell
            </Button>
          </Box>
        )}
      </FieldArray>
    </Box>
  );
};

// ─── Step Content ─────────────────────────────────────────────────────────────

const renderStep = (
  step: number,
  values: any,
  handleChange: any,
  setFieldValue: any,
  categoriesData: any,
  brandsData: any,
  currentProductId?: string
) => {
  switch (step) {
    // ── Step 0: Basic Info ───────────────────────────────────────────────────
    case 0:
      return (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">Provide the core product identity and classification.</Alert>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MaterialTextField name="name" label="Product Name *" fullWidth />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MaterialTextField
              name="shortDescription"
              label="Short Description *"
              multiline
              rows={2}
              fullWidth
              helperText="Shown in product cards — max 200 characters"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MaterialTextField
              name="description"
              label="Full Description"
              multiline
              rows={4}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialTextField
              name="code"
              label="Product Code"
              fullWidth
              helperText="used for SKU prefix generation"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
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
          <Grid size={{ xs: 12 }}>
            <MaterialSelectField
              name="brandId"
              label="Brand *"
              options={
                brandsData?.data?.map((brand: any) => ({
                  value: brand.id,
                  label: brand.name,
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
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">Configure pricing, GST classification, and purchasable units.</Alert>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>Base Pricing</SectionHeader>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialSelectField
              name="baseUnit"
              label="Base Unit *"
              options={PRODUCT_UNITS}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialTextField
              name="basePrice"
              label="Base Price (₹) *"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>Tax Details</SectionHeader>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialTextField
              name="hsnCode"
              label="HSN Code"
              fullWidth
              helperText="Harmonized System Nomenclature code for GST filing"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialSelectField
              name="gstRate"
              label="GST Rate *"
              options={GST_RATES.map((r) => ({ value: r.value, label: r.label }))}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>Available Units</SectionHeader>
            <AvailableUnitsInput name="availableUnits" />
          </Grid>
        </Grid>
      );

    // ── Step 2: Variants ─────────────────────────────────────────────────────
    case 2:
      return (
        <VariantsStepInput
          values={values}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
      );

    // ── Step 3: Inventory ────────────────────────────────────────────────────
    case 3:
      return (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">Manage stock levels and pre-order settings.</Alert>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>Stock</SectionHeader>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialTextField
              name="stockQuantity"
              label="Stock Quantity"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialTextField
              name="lowStockThreshold"
              label="Low Stock Alert Threshold"
              type="number"
              fullWidth
              helperText="Alert fires when quantity falls below this number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Checkbox name="inStock" checked={values.inStock} onChange={handleChange} />}
              label="Currently In Stock"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>Pre-order</SectionHeader>
          </Grid>
          <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 6 }}>
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

    // ── Step 4: Bakery Details ───────────────────────────────────────────────
    case 4:
      return (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">Physical attributes and storage guidance.</Alert>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>Weight & Packaging</SectionHeader>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialTextField
              name="weight"
              label="Weight"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
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
          <Grid size={{ xs: 6 }}>
            <MaterialTextField
              name="piecesPerPack"
              label="Pieces Per Pack"
              type="number"
              fullWidth
              helperText="How many individual pieces come in one pack"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <MaterialTextField
              name="shelfLife"
              label="Shelf Life (days)"
              type="number"
              fullWidth
              helperText="How many days this product remains fresh"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
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

    // ── Step 5: Dietary & Allergens ──────────────────────────────────────────
    case 5:
      return (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">Dietary status, allergen info, and nutritional breakdown.</Alert>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionHeader>Dietary Tags</SectionHeader>
            <DietaryTagsInput name="dietaryTags" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionHeader>Allergen Information</SectionHeader>
            <AllergenInfoInput name="allergenInfo" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionHeader>Nutritional Information (per serving)</SectionHeader>
            <NutritionalInfoInput />
          </Grid>
        </Grid>
      );

    // ── Step 6: Add-ons & Modifiers ──────────────────────────────────────────
    case 6:
      return (
        <ModifiersStepInput
          values={values}
          setFieldValue={setFieldValue}
        />
      );

    // ── Step 7: Cross-Brand Upsells ──────────────────────────────────────────
    case 7:
      return (
        <CrossBrandUpsellsStepInput
          values={values}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          currentProductId={currentProductId}
        />
      );

    // ── Step 8: Media ────────────────────────────────────────────────────────
    case 8:
      return (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">Select images from your media library.</Alert>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionHeader>Main Image</SectionHeader>
            <SingleImagePicker
              idField="mainImageId"
              urlField="_mainImageUrl"
              label="Main Image"
              helperText="Primary product photo shown on the product detail page"
              slot="productCard"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionHeader>Thumbnail</SectionHeader>
            <SingleImagePicker
              idField="thumbnailId"
              urlField="_thumbnailUrl"
              label="Thumbnail"
              helperText="Smaller image used in listing cards (falls back to main image)"
              slot="productCard"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionHeader>Gallery</SectionHeader>
            <GalleryPickerInput name="gallery" />
          </Grid>
        </Grid>
      );

    // ── Step 9: SEO & Promotions ─────────────────────────────────────────────
    case 9:
      return (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">SEO metadata, promotional flags, and seasonal availability.</Alert>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>SEO</SectionHeader>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MaterialTextField
              name="seoTitle"
              label="SEO Title"
              fullWidth
              helperText="Leave empty to use product name"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MaterialTextField
              name="seoDescription"
              label="SEO Description"
              multiline
              rows={2}
              fullWidth
              helperText="Meta description for search engines (150–160 chars recommended)"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>Promotional Flags</SectionHeader>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Tooltip title="Show in featured product carousels">
              <FormControlLabel
                control={
                  <Checkbox name="featured" checked={values.featured} onChange={handleChange} />
                }
                label="Featured"
              />
            </Tooltip>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
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
          <Grid size={{ xs: 12, sm: 4 }}>
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

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader>Seasonal Availability</SectionHeader>
          </Grid>
          <Grid size={{ xs: 12 }}>
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
              <Grid size={{ xs: 6 }}>
                <MaterialTextField
                  name="availableFrom"
                  label="Available From"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
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
          <Grid size={{ xs: 6 }}>
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
  const { data: fullProductResponse } = useGetProductQuery(
    { id: selectedProduct?.id },
    { skip: !isEditing || !selectedProduct?.id }
  );
  const activeProduct = fullProductResponse?.data || selectedProduct;

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: brandsData } = useGetAllBrandsQuery();

  const [createProduct, { isLoading: isCreateLoading, isSuccess: isCreateSuccess, error: createError }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, error: updateError }] =
    useUpdateProductMutation();

  // All fields map 1:1 with CreateProductDto.
  // _mainImageUrl / _thumbnailUrl are UI-only for image previews — stripped before submit.
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
    gstRate: activeProduct?.gstRate ?? 5,

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

    // UI-only preview URLs — NOT sent to API
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
      // Strip UI-only preview URL fields
      const { _mainImageUrl, _thumbnailUrl, ...rest } = values;

      // Format variants
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

      // Format cross-brand upsells
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
        variants: formattedVariants,
        modifierGroupIds: rest.modifierGroupIds || [],
        crossBrandUpsells: formattedUpsells,
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
      {({ isSubmitting, submitForm, values, handleChange, setFieldValue }) => (
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
              {renderStep(
                activeStep,
                values,
                handleChange,
                setFieldValue,
                categoriesData,
                brandsData,
                activeProduct?.id
              )}
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