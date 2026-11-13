"use client";

import { MaterialTextField } from "@/components/common/CustomFields";
import SectionHeader from "@/components/common/SectionHeader";
import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useField } from "formik";
import {
  DIETARY_OPTIONS,
  getDietaryChipColor,
  resolveDietaryTags,
} from "@/utils/dietary";

export { DIETARY_OPTIONS, getDietaryChipColor, resolveDietaryTags };

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

const DietaryTagsInput = ({ name }: { name: string }) => {
  const [field, , helpers] = useField(name);
  const value: string[] = field.value || [];
  const toggle = (tag: string) => {
    helpers.setValue(resolveDietaryTags(value, tag));
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
        Click to toggle dietary lifestyle tags
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mt: 0.5 }}>
        {DIETARY_OPTIONS.map((opt) => (
          <Chip
            key={opt}
            label={opt.replace(/_/g, " ").toUpperCase()}
            onClick={() => toggle(opt)}
            color={value.includes(opt) ? getDietaryChipColor(opt) : "default"}
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
      <Typography variant="subtitle2" gutterBottom fontWeight={600} color="error.main">
        Contains (definitely present):
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1.5 }}>
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
      <Typography variant="subtitle2" gutterBottom fontWeight={600} color="warning.main">
        May Contain (traces possible):
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
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
  <Grid container spacing={1.5}>
    {[
      { name: "nutritionalInfo.calories", label: "Calories (kcal)" },
      { name: "nutritionalInfo.protein", label: "Protein (g)" },
      { name: "nutritionalInfo.carbs", label: "Carbs (g)" },
      { name: "nutritionalInfo.fat", label: "Fat (g)" },
      { name: "nutritionalInfo.saturatedFat", label: "Sat Fat (g)" },
      { name: "nutritionalInfo.fiber", label: "Fiber (g)" },
      { name: "nutritionalInfo.sugar", label: "Sugar (g)" },
      { name: "nutritionalInfo.sodium", label: "Sodium (mg)" },
    ].map(({ name, label }) => (
      <Grid size={{ xs: 6, sm: 3 }} key={name}>
        <MaterialTextField name={name} label={label} type="number" fullWidth size="small" />
      </Grid>
    ))}
  </Grid>
);

export default function DietarySection() {
  return (
    <Card
      id="sec-dietary"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <SectionHeader>Dietary, Allergens & Nutrition</SectionHeader>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Safety warnings for allergens and dietary preferences displayed to customers.
      </Typography>

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Dietary Badges
      </Typography>
      <DietaryTagsInput name="dietaryTags" />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Allergen Disclosure
      </Typography>
      <AllergenInfoInput name="allergenInfo" />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Nutritional Breakdown (per serving)
      </Typography>
      <NutritionalInfoInput />
    </Card>
  );
}
