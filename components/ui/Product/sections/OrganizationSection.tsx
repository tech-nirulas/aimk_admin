"use client";

import { MaterialSelectField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import { useGetAllBrandsQuery } from "@/features/brand/brandApiService";
import { useGetAllCategoriesQuery } from "@/features/categories/categoriesApiService";
import { Card, Grid, Typography } from "@mui/material";

export default function OrganizationSection() {
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: brandsData } = useGetAllBrandsQuery();

  return (
    <Card
      id="sec-organization"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <SectionHeader>Organization & Classification</SectionHeader>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Assign brand ownership and primary category hierarchy.
      </Typography>

      <Grid container spacing={2.5}>
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

        <Grid size={{ xs: 12 }}>
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
    </Card>
  );
}
