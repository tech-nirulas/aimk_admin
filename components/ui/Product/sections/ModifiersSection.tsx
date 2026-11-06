"use client";

import SectionHeader from "@/components/common/SectionHeader";
import { useGetModifiersQuery } from "@/features/modifiers/modifierApiService";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useFormikContext } from "formik";

export default function ModifiersSection() {
  const { values, setFieldValue } = useFormikContext<any>();
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
    <Card
      id="sec-modifiers"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <SectionHeader>Add-ons & Modifiers</SectionHeader>
        <Chip
          label={`${selectedIds.length} group(s) attached`}
          color={selectedIds.length > 0 ? "primary" : "default"}
          size="small"
        />
      </Box>

      <Alert severity="info" sx={{ mb: 2.5 }}>
        Attach modifier groups to this product. When customers click &quot;Add&quot; or &quot;Customize&quot;, these options will pop up as EatSure-style customization sheets (e.g. Candles, Message Plaques, Crust Choices).
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
          {groups.map((group: any) => {
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
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
    </Card>
  );
}
