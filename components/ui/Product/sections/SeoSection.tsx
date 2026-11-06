"use client";

import { MaterialTextField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import {
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import { useFormikContext } from "formik";

export default function SeoSection() {
  const { values, handleChange } = useFormikContext<any>();

  return (
    <Card
      id="sec-seo"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <SectionHeader>SEO & Merchandising</SectionHeader>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Search engine ranking titles, featured badges, and holiday availability windows.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <MaterialTextField
            name="seoTitle"
            label="SEO Page Title"
            fullWidth
            helperText="Leave empty to default to product name"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <MaterialTextField
            name="seoDescription"
            label="SEO Meta Description"
            multiline
            rows={2}
            fullWidth
            helperText="Recommended 150–160 characters for Google SERPs"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 0.5 }} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Badges & Merchandising Highlights
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Tooltip title="Show in homepage featured collection">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="featured"
                      checked={Boolean(values.featured)}
                      onChange={handleChange}
                    />
                  }
                  label="Featured"
                />
              </Tooltip>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Tooltip title="Highlight with Best Seller ribbon">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="bestSeller"
                      checked={Boolean(values.bestSeller)}
                      onChange={handleChange}
                    />
                  }
                  label="Best Seller"
                />
              </Tooltip>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Tooltip title="Highlight with New Arrival badge">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="newArrival"
                      checked={Boolean(values.newArrival)}
                      onChange={handleChange}
                    />
                  }
                  label="New Arrival"
                />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 0.5 }} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Seasonal Window & Order Limits
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                name="isSeasonal"
                checked={Boolean(values.isSeasonal)}
                onChange={handleChange}
              />
            }
            label="Seasonal Product (active only between dates)"
          />
        </Grid>

        {values.isSeasonal && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MaterialTextField
                name="availableFrom"
                label="Available From"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MaterialTextField
                name="availableUntil"
                label="Available Until"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }}>
          <MaterialTextField
            name="maxPerOrder"
            label="Maximum Quantity Per Order"
            type="number"
            fullWidth
            helperText="Leave empty for unlimited quantity per cart"
            inputProps={{ min: 1 }}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
