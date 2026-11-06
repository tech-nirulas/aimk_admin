"use client";

import ImageSpecHint from "@/components/common/ImageSpecHint";
import SectionHeader from "@/components/common/SectionHeader";
import MediaPickerModal, { MediaItem } from "@/components/ui/Media/MediaPickerModal";
import type { ImageSlotName } from "@aimk/image-spec";
import { Close as CloseIcon, Image as ImageIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Field, useField } from "formik";
import { useState } from "react";

const SingleImagePicker = ({
  idField,
  urlField,
  label,
  helperText,
  slot,
}: {
  idField: string;
  urlField: string;
  label: string;
  helperText?: string;
  slot?: ImageSlotName;
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDims, setSelectedDims] = useState<{
    width?: number | null;
    height?: number | null;
  } | null>(null);

  return (
    <Field name={idField}>
      {({ field, form }: any) => (
        <Box>
          {helperText && (
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {helperText}
            </Typography>
          )}
          {slot && (
            <Box sx={{ mb: 1.5 }}>
              <ImageSpecHint slot={slot} dimensions={field.value ? selectedDims : null} />
            </Box>
          )}
          {field.value && (
            <Box
              sx={{
                mb: 1.5,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                width: "100%",
                height: 140,
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={form.values[urlField] || ""}
                alt={label}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <IconButton
                size="small"
                onClick={() => {
                  form.setFieldValue(idField, "");
                  form.setFieldValue(urlField, "");
                }}
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  bgcolor: "rgba(15,23,42,0.7)",
                  color: "white",
                  "&:hover": { bgcolor: "error.main" },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setPickerOpen(true)}
            startIcon={<ImageIcon />}
            sx={{ justifyContent: "flex-start", color: "text.secondary" }}
          >
            {field.value ? `Change ${label}` : `Select ${label}`}
          </Button>
          <MediaPickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            allowedTypes={["image"]}
            title={`Select ${label}`}
            slot={slot}
            onSelect={(media) => {
              const m = media as MediaItem;
              form.setFieldValue(idField, m.id);
              form.setFieldValue(urlField, m.url);
              setSelectedDims({ width: m.width, height: m.height });
              setPickerOpen(false);
            }}
          />
        </Box>
      )}
    </Field>
  );
};

const GalleryPickerInput = ({ name }: { name: string }) => {
  const [, , helpers] = useField(name);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);

  const handleSelect = (selected: MediaItem | MediaItem[]) => {
    const items = Array.isArray(selected) ? selected : [selected];
    const merged = [
      ...galleryItems,
      ...items.filter((m) => !galleryItems.find((g) => g.id === m.id)),
    ];
    setGalleryItems(merged);
    helpers.setValue(merged.map((m) => m.id));
    setPickerOpen(false);
  };

  const removeItem = (id: string) => {
    const updated = galleryItems.filter((m) => m.id !== id);
    setGalleryItems(updated);
    helpers.setValue(updated.map((m) => m.id));
  };

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <ImageSpecHint slot="productGallery" />
      </Box>
      <Button
        variant="outlined"
        startIcon={<ImageIcon />}
        onClick={() => setPickerOpen(true)}
        size="small"
        sx={{ mb: 2 }}
      >
        Add Gallery Images
      </Button>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {galleryItems.map((item) => (
          <Box
            key={item.id}
            sx={{
              position: "relative",
              width: 80,
              height: 80,
              borderRadius: 1.5,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              component="img"
              src={item.thumbnailUrl || item.url}
              alt={item.filename}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <IconButton
              size="small"
              onClick={() => removeItem(item.id)}
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                bgcolor: "rgba(0,0,0,0.6)",
                color: "white",
                p: 0.25,
                "&:hover": { bgcolor: "error.main" },
              }}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        ))}
      </Box>
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        multiple
        allowedTypes={["image"]}
        title="Select Gallery Images"
        slot="productGallery"
      />
    </Box>
  );
};

export default function MediaGallerySection() {
  return (
    <Card
      id="sec-media"
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <SectionHeader>Media & Visuals</SectionHeader>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Upload or select high-resolution imagery for menu cards, detail pages, and social previews.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Main Product Image
          </Typography>
          <SingleImagePicker
            idField="mainImageId"
            urlField="_mainImageUrl"
            label="Main Image"
            helperText="Primary photo shown on storefront product detail page"
            slot="productCard"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Thumbnail Image
          </Typography>
          <SingleImagePicker
            idField="thumbnailId"
            urlField="_thumbnailUrl"
            label="Thumbnail"
            helperText="Smaller image for cart drawers and listing grids (falls back to main)"
            slot="productCard"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Product Gallery
          </Typography>
          <GalleryPickerInput name="gallery" />
        </Grid>
      </Grid>
    </Card>
  );
}
