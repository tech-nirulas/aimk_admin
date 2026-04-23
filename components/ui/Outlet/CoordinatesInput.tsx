"use client";

import {
  GpsFixed as GpsIcon,
  LocationOn as PinIcon,
  OpenInNew as OpenInNewIcon,
  MyLocation as MyLocationIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useField } from "formik";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coordinates {
  lat?: number | string;
  lng?: number | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidLat(v: string | number | undefined): boolean {
  const n = Number(v);
  return !isNaN(n) && n >= -90 && n <= 90;
}

function isValidLng(v: string | number | undefined): boolean {
  const n = Number(v);
  return !isNaN(n) && n >= -180 && n <= 180;
}

function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CoordinatesInput({ name }: { name: string }) {
  const [field, meta, helpers] = useField<Coordinates>(name);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const coords: Coordinates =
    field.value && typeof field.value === "object" ? field.value : {};

  const lat = coords.lat !== undefined ? String(coords.lat) : "";
  const lng = coords.lng !== undefined ? String(coords.lng) : "";

  const hasValid = isValidLat(lat) && isValidLng(lng) && lat !== "" && lng !== "";

  const setLat = (value: string) => {
    helpers.setValue({ ...coords, lat: value });
  };

  const setLng = (value: string) => {
    helpers.setValue({ ...coords, lng: value });
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        helpers.setValue({
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        });
        setLocating(false);
      },
      (err) => {
        setGeoError("Could not get location. Please enter manually.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handlePasteFromMaps = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Try to parse "lat, lng" or Google Maps URL patterns
      const coordMatch = text.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
      if (coordMatch) {
        const parsedLat = parseFloat(coordMatch[1]);
        const parsedLng = parseFloat(coordMatch[2]);
        if (isValidLat(parsedLat) && isValidLng(parsedLng)) {
          helpers.setValue({ lat: parsedLat, lng: parsedLng });
        }
      }
    } catch {
      // clipboard not available — silent fail
    }
  };

  return (
    <Box>
      {/* Input row */}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Latitude */}
        <TextField
          label="Latitude"
          size="small"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="e.g. 12.9716"
          type="number"
          inputProps={{ step: "any", min: -90, max: 90 }}
          error={lat !== "" && !isValidLat(lat)}
          helperText={lat !== "" && !isValidLat(lat) ? "Must be –90 to 90" : ""}
          sx={{ flex: 1, minWidth: 140 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  LAT
                </Typography>
              </InputAdornment>
            ),
          }}
        />

        {/* Longitude */}
        <TextField
          label="Longitude"
          size="small"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="e.g. 77.5946"
          type="number"
          inputProps={{ step: "any", min: -180, max: 180 }}
          error={lng !== "" && !isValidLng(lng)}
          helperText={lng !== "" && !isValidLng(lng) ? "Must be –180 to 180" : ""}
          sx={{ flex: 1, minWidth: 140 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  LNG
                </Typography>
              </InputAdornment>
            ),
          }}
        />

        {/* Use my location */}
        <Tooltip title="Use my current location">
          <span>
            <Button
              variant="outlined"
              size="small"
              onClick={handleGeolocate}
              disabled={locating}
              startIcon={
                locating ? (
                  <CircularProgress size={14} />
                ) : (
                  <MyLocationIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{ height: 40, whiteSpace: "nowrap" }}
            >
              {locating ? "Locating…" : "Use GPS"}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Geo error */}
      {geoError && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
          {geoError}
        </Typography>
      )}

      {/* Preview card */}
      {hasValid ? (
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: alpha("#6366F1", 0.04),
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <PinIcon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Coordinates set
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
            >
              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </Typography>
          </Box>
          <Tooltip title="Verify on Google Maps">
            <IconButton
              size="small"
              component="a"
              href={buildGoogleMapsUrl(Number(lat), Number(lng))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 1.5,
            p: 1.25,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <GpsIcon sx={{ color: "text.disabled", fontSize: 18 }} />
          <Typography variant="caption" color="text.secondary">
            Enter coordinates manually, use GPS, or{" "}
            <Box
              component="span"
              onClick={handlePasteFromMaps}
              sx={{
                color: "primary.main",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              paste from Google Maps
            </Box>
          </Typography>
        </Box>
      )}
    </Box>
  );
}