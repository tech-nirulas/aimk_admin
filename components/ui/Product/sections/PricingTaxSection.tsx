"use client";

import { MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useField } from "formik";
import { useState } from "react";

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

const GstRateSelect = () => {
  const [field, meta, helpers] = useField("gstRate");
  const errorText = meta.touched && meta.error ? meta.error : "";
  const numericVal =
    field.value !== undefined && field.value !== null && field.value !== ""
      ? Number(field.value)
      : 5;

  return (
    <FormControl fullWidth size="small" error={!!errorText}>
      <InputLabel id="gst-rate-select-label">GST Rate *</InputLabel>
      <Select
        labelId="gst-rate-select-label"
        id="gst-rate-select"
        label="GST Rate *"
        value={numericVal}
        onChange={(e) => helpers.setValue(Number(e.target.value))}
      >
        {GST_RATES.map((r) => (
          <MenuItem key={r.value} value={r.value}>
            {r.label}
          </MenuItem>
        ))}
      </Select>
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
};

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
        Define additional purchasable units and their equivalent base quantity multiplier
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <TextField
          label="Unit Name"
          size="small"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g. dozen"
          sx={{ flex: 1, minWidth: 120 }}
        />
        <TextField
          label="Qty / Multiplier"
          size="small"
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="e.g. 12"
          sx={{ flex: 1, minWidth: 100 }}
        />
        <Button variant="contained" size="small" onClick={addUnit} startIcon={<Add />}>
          Add Unit
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

export default function PricingTaxSection() {
  return (
    <Card
      id="sec-pricing"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <SectionHeader>Pricing & Tax</SectionHeader>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Set base pricing, GST categorization, and purchasing quantity multipliers.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MaterialSelectField
            name="baseUnit"
            label="Base Unit *"
            options={PRODUCT_UNITS}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MaterialTextField
            name="basePrice"
            label="Base Price (₹) *"
            type="number"
            fullWidth
            inputProps={{ min: 0, step: "0.01" }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <MaterialTextField
            name="hsnCode"
            label="HSN Code"
            fullWidth
            helperText="Harmonized System Nomenclature for GST filing"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <GstRateSelect />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 1 }}>
            Additional Purchasable Units
          </Typography>
          <AvailableUnitsInput name="availableUnits" />
        </Grid>
      </Grid>
    </Card>
  );
}
