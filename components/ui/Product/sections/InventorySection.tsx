"use client";

import { MaterialTextField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import {
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { useFormikContext } from "formik";

export default function InventorySection() {
  const { values, handleChange } = useFormikContext<any>();

  return (
    <Card
      id="sec-inventory"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <SectionHeader>Inventory & Stock</SectionHeader>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Manage real-time stock levels, low-quantity alerts, and pre-order lead times.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MaterialTextField
            name="stockQuantity"
            label="Stock Quantity"
            type="number"
            fullWidth
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MaterialTextField
            name="lowStockThreshold"
            label="Low Stock Threshold"
            type="number"
            fullWidth
            helperText="Alert fires when stock drops below this"
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="inStock"
                checked={values.inStock !== false}
                onChange={handleChange}
              />
            }
            label="Item is Available in Stock"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 0.5 }} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Pre-order Fulfillment
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                name="preorderEnabled"
                checked={Boolean(values.preorderEnabled)}
                onChange={handleChange}
              />
            }
            label="Enable Made-to-Order / Pre-order"
          />
        </Grid>

        {values.preorderEnabled && (
          <Grid size={{ xs: 12 }}>
            <MaterialTextField
              name="preorderLeadDays"
              label="Pre-order Lead Time (Days)"
              type="number"
              fullWidth
              helperText="Preparation days needed before fulfilling order"
              inputProps={{ min: 1 }}
            />
          </Grid>
        )}
      </Grid>
    </Card>
  );
}
