"use client";

import SectionHeader from "@/components/common/SectionHeader";
import { useGetAllProductsQuery } from "@/features/products/productApiService";
import { Add, Delete as DeleteIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
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

export default function CrossBrandUpsellsSection({
  currentProductId,
}: {
  currentProductId?: string;
}) {
  const { values, handleChange, setFieldValue } = useFormikContext<any>();
  const { data: productsData } = useGetAllProductsQuery({ isActive: true });
  const allProducts = (productsData?.data || []).filter(
    (p: any) => p.id !== currentProductId
  );

  return (
    <Card
      id="sec-upsells"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <SectionHeader>Cross-Brand Upsells</SectionHeader>
        <Typography variant="caption" color="text.secondary">
          {values.crossBrandUpsells?.length || 0} upsell(s) configured
        </Typography>
      </Box>

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
                sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}
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

                  <Grid size={{ xs: 6, sm: 6 }}>
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

                  <Grid size={{ xs: 6, sm: 6 }}>
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
                      label={<Typography variant="caption">Active on storefront</Typography>}
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
              sx={{ alignSelf: "flex-start", mt: 1 }}
            >
              + Add Cross-Brand Upsell
            </Button>
          </Box>
        )}
      </FieldArray>
    </Card>
  );
}
