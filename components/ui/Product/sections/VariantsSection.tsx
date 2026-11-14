"use client";

import SectionHeader from "@/components/common/SectionHeader";
import { Add, Delete as DeleteIcon, Link as LinkIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { FieldArray, useFormikContext } from "formik";
import { useGetVariantMastersQuery } from "@/features/variant-master/variantMasterApiService";

export default function VariantsSection() {
  const { values, handleChange, setFieldValue } = useFormikContext<any>();
  const { data: mastersData } = useGetVariantMastersQuery({ isActive: true });
  const masters = mastersData?.data || [];

  return (
    <Card
      id="sec-variants"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <SectionHeader>Portion Sizes & Variants</SectionHeader>
        <Typography variant="caption" color="text.secondary">
          {values.variants?.length || 0} variant(s) configured
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 2.5 }}>
        Variants represent purchasable portion sizes (e.g. 500g, 1kg, Box of 6). If no variants are added, this product will be purchased at the Base Price (₹{values.basePrice || 0}).
      </Alert>

      <FieldArray name="variants">
        {({ push, remove }) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {values.variants?.map((v: any, index: number) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  position: "relative",
                  border: v.isDefault ? "2px solid" : "1px solid",
                  borderColor: v.isDefault ? "primary.main" : "divider",
                  bgcolor: v.isDefault ? "action.hover" : "background.paper",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Variant #{index + 1}: {v.name || "Untitled Size"}
                    </Typography>
                    {v.variantMasterId && (
                      <Chip
                        icon={<LinkIcon sx={{ "&&": { fontSize: 14 } }} />}
                        label="Linked to Master"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    {v.isDefault && (
                      <Chip label="Default Storefront Size" color="primary" size="small" />
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
                  {masters.length > 0 && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Link to Variant Master (Optional)</InputLabel>
                        <Select
                          value={v.variantMasterId || ""}
                          label="Link to Variant Master (Optional)"
                          onChange={(e) => {
                            const masterId = e.target.value;
                            setFieldValue(`variants.${index}.variantMasterId`, masterId || null);
                            if (masterId) {
                              const found = masters.find((m) => m.id === masterId);
                              if (found) {
                                setFieldValue(`variants.${index}.name`, found.name);
                                if (found.defaultWeight !== null && found.defaultWeight !== undefined) {
                                  setFieldValue(`variants.${index}.weight`, found.defaultWeight);
                                }
                                if (found.defaultWeightUnit) {
                                  setFieldValue(`variants.${index}.weightUnit`, found.defaultWeightUnit);
                                }
                              }
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>Custom / Unlinked</em>
                          </MenuItem>
                          {masters.map((m) => (
                            <MenuItem key={m.id} value={m.id}>
                              {m.name} ({m.category} {m.defaultWeight ? `• ${m.defaultWeight}${m.defaultWeightUnit || "g"}` : ""})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12, sm: masters.length > 0 ? 6 : 12 }}>
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
                      label="Selling Price (₹) *"
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
                      label="MRP / Strike Price (₹)"
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
                      label={<Typography variant="body2">In Stock</Typography>}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 9 }}>
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
                  displayOrder: values.variants?.length || 0,
                  variantMasterId: null,
                })
              }
              sx={{ alignSelf: "flex-start", mt: 1 }}
            >
              + Add Product Variant
            </Button>
          </Box>
        )}
      </FieldArray>
    </Card>
  );
}
