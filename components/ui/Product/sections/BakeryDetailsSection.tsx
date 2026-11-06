"use client";

import { MaterialSelectField, MaterialTextField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import { Card, Grid, Typography } from "@mui/material";

export default function BakeryDetailsSection() {
  return (
    <Card
      id="sec-bakery"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <SectionHeader>Bakery Specs & Handling</SectionHeader>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Portion weights, shelf life durability, and customer storage advice.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MaterialTextField
            name="weight"
            label="Base Weight"
            type="number"
            fullWidth
            inputProps={{ min: 0, step: "0.01" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
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

        <Grid size={{ xs: 12, sm: 6 }}>
          <MaterialTextField
            name="piecesPerPack"
            label="Pieces Per Pack"
            type="number"
            fullWidth
            helperText="Count per box (e.g. 6 macarons)"
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MaterialTextField
            name="shelfLife"
            label="Shelf Life (days)"
            type="number"
            fullWidth
            helperText="Days product stays fresh"
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <MaterialTextField
            name="storageInstructions"
            label="Storage Instructions"
            multiline
            rows={2}
            fullWidth
            placeholder="e.g. Store refrigerated at 4°C. Consume within 48 hours."
          />
        </Grid>
      </Grid>
    </Card>
  );
}
