"use client";

/**
 * ImageSpecHint — shows the upload requirements for a specific image slot.
 *
 * Reads every value from the shared `@aimk/image-spec` package, which is the
 * single source of truth also consumed by the angels storefront and by
 * IMAGE_GUIDELINES.md. Never hardcode dimensions in the admin UI.
 *
 * Optionally takes the dimensions of an already-selected media item and renders
 * advisory warnings. Those warnings are informational only — nothing here
 * blocks upload or selection.
 */

import {
  IMAGE_SLOTS,
  IMAGE_SLOT_NAMES,
  validateImageAgainstSpec,
  type ImageSlotName,
} from "@aimk/image-spec";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export interface ImageSpecHintProps {
  /** Which slot's requirements to display. */
  slot: ImageSlotName;
  /**
   * Dimensions of the currently selected/staged image. When present and
   * non-null, advisory warnings are appended. Legacy media with missing
   * dimensions produces no warnings.
   */
  dimensions?: { width?: number | null; height?: number | null } | null;
  /** Compact single-line layout for tight spaces (e.g. inside a picker). */
  dense?: boolean;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <Typography variant="caption" component="div" sx={{ lineHeight: 1.7 }}>
    <strong>{label}:</strong> {value}
  </Typography>
);

export default function ImageSpecHint({
  slot,
  dimensions,
  dense = false,
}: ImageSpecHintProps) {
  const spec = IMAGE_SLOTS[slot];
  const issues = dimensions ? validateImageAgainstSpec(dimensions, spec) : [];

  const [recW, recH] = spec.recommended;
  const [minW, minH] = spec.minimum;

  return (
    <Box>
      <Alert
        severity="info"
        icon={<AspectRatioIcon />}
        sx={{ borderRadius: 2, mb: issues.length ? 1 : 0, py: dense ? 0.5 : 1 }}
      >
        <AlertTitle sx={{ fontWeight: 800, fontSize: "0.8rem", mb: 0.5 }}>
          Image requirements — {spec.label}
        </AlertTitle>

        <Row label="Recommended" value={`${recW} × ${recH} px`} />
        <Row label="Minimum" value={`${minW} × ${minH} px`} />
        <Row label="Aspect ratio" value={spec.ratio} />
        <Row
          label="Fit"
          value={
            spec.fit === "cover"
              ? `Cover${spec.cropped ? " — the image will be cropped to fit" : ""}`
              : "Contain — the whole image is shown, never cropped"
          }
        />
        <Row
          label="Format"
          value={
            spec.transparency
              ? `${spec.format} (transparency supported)`
              : `${spec.format} (no transparency)`
          }
        />

        {!dense && (
          <Typography
            variant="caption"
            component="div"
            sx={{ mt: 1, display: "block", fontStyle: "italic", lineHeight: 1.6 }}
          >
            {spec.safeArea}
          </Typography>
        )}
      </Alert>

      {issues.map((issue) => (
        <Alert
          key={issue.code}
          severity="warning"
          sx={{ borderRadius: 2, mt: 1, py: 0.5 }}
        >
          <Typography variant="caption" component="div" sx={{ lineHeight: 1.6 }}>
            {issue.message}
          </Typography>
        </Alert>
      ))}
    </Box>
  );
}

/**
 * ImageSpecReference — collapsed table of every image slot's requirements.
 *
 * For the generic media-library upload zone, where the destination slot is not
 * known in advance. Same source of truth as ImageSpecHint; nothing hardcoded.
 */
export function ImageSpecReference() {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        mb: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AspectRatioIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Image requirements — what size should I upload?
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Used for</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Recommended</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Minimum</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Ratio</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cropped?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {IMAGE_SLOT_NAMES.map((name) => {
                const spec = IMAGE_SLOTS[name];
                return (
                  <TableRow key={name}>
                    <TableCell>{spec.label}</TableCell>
                    <TableCell align="right">
                      {spec.recommended[0]} × {spec.recommended[1]}
                    </TableCell>
                    <TableCell align="right">
                      {spec.minimum[0]} × {spec.minimum[1]}
                    </TableCell>
                    <TableCell align="right">{spec.ratio}</TableCell>
                    <TableCell>{spec.cropped ? "Yes" : "No"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1.5, display: "block" }}
        >
          Larger than recommended is always fine — uploads are never rejected for size.
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
