"use client";

import { MaterialTextField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import { Card, Grid, Typography } from "@mui/material";

export default function BasicInfoSection() {
  return (
    <Card
      id="sec-overview"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <SectionHeader>Product Overview</SectionHeader>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Core identification details displayed on product listings and customer receipts.
      </Typography>

      <Grid container spacing={2.5}>
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
            helperText="Shown in product cards and checkout sheets — max 200 characters"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <MaterialTextField
            name="description"
            label="Full Description"
            multiline
            rows={4}
            fullWidth
            placeholder="Detailed description, ingredients highlight, serving suggestions..."
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <MaterialTextField
            name="code"
            label="Product Code / SKU Prefix"
            fullWidth
            helperText="Internal item code used for kitchen inventory tracking"
          />
        </Grid>
      </Grid>
    </Card>
  );
}
