"use client";

import {
  AccessTime as ClockIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Tooltip,
  Typography
} from "@mui/material";
import { useField } from "formik";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DaySchedule {
  isOpen: boolean;
  slots: { open: string; close: string }[];
}

type WeekSchedule = Record<string, DaySchedule>;

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

// Generate time options in 15-min intervals: 12:00 AM → 11:45 PM + "Midnight"
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    const value = `${hh}:${mm}`;
    const period = h < 12 ? "AM" : "PM";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const label = `${displayH}:${mm} ${period}`;
    TIME_OPTIONS.push({ value, label });
  }
}
TIME_OPTIONS.push({ value: "23:59", label: "Midnight" });

const DEFAULT_SLOT = { open: "09:00", close: "21:00" };

const DEFAULT_SCHEDULE: WeekSchedule = DAYS.reduce((acc, d) => {
  acc[d.key] = {
    isOpen: !["saturday", "sunday"].includes(d.key) ? true : false,
    slots: [{ ...DEFAULT_SLOT }],
  };
  return acc;
}, {} as WeekSchedule);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function summarizeDay(schedule: DaySchedule): string {
  if (!schedule.isOpen) return "Closed";
  if (!schedule.slots || schedule.slots.length === 0) return "Open (no hours set)";
  return schedule.slots
    .map((s) => {
      const toLabel = (val: string) =>
        TIME_OPTIONS.find((t) => t.value === val)?.label ?? val;
      return `${toLabel(s.open)} – ${toLabel(s.close)}`;
    })
    .join(", ");
}

// ─── TimeSelect ───────────────────────────────────────────────────────────────

function TimeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      sx={{
        minWidth: 120,
        fontSize: "0.8rem",
        ".MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
      }}
      MenuProps={{ PaperProps: { sx: { maxHeight: 260 } } }}
    >
      {TIME_OPTIONS.map((opt) => (
        <MenuItem key={opt.value} value={opt.value} dense sx={{ fontSize: "0.8rem" }}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
}

// ─── DayRow ───────────────────────────────────────────────────────────────────

function DayRow({
  dayKey,
  label,
  schedule,
  onChange,
  onCopyToAll,
}: {
  dayKey: string;
  label: string;
  schedule: DaySchedule;
  onChange: (updated: DaySchedule) => void;
  onCopyToAll: (schedule: DaySchedule) => void;
}) {
  const setSlot = (index: number, field: "open" | "close", value: string) => {
    const slots = [...schedule.slots];
    slots[index] = { ...slots[index], [field]: value };
    onChange({ ...schedule, slots });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
        flexWrap: "wrap",
      }}
    >
      {/* Day name + toggle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 140 }}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={schedule.isOpen}
              onChange={(e) => onChange({ ...schedule, isOpen: e.target.checked })}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 90 }}>
              {label}
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </Box>

      {/* Slots or Closed label */}
      {schedule.isOpen ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
          {schedule.slots.map((slot, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <TimeSelect value={slot.open} onChange={(v) => setSlot(i, "open", v)} />
              <Typography variant="caption" color="text.secondary">to</Typography>
              <TimeSelect value={slot.close} onChange={(v) => setSlot(i, "close", v)} />
              {schedule.slots.length > 1 && (
                <Tooltip title="Remove this slot">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const slots = schedule.slots.filter((_, idx) => idx !== i);
                      onChange({ ...schedule, slots });
                    }}
                    sx={{ color: "error.main", p: 0.5 }}
                  >
                    ×
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}

          {/* Add split shift */}
          {schedule.slots.length < 2 && (
            <Box
              component="span"
              onClick={() =>
                onChange({
                  ...schedule,
                  slots: [...schedule.slots, { open: "14:00", close: "18:00" }],
                })
              }
              sx={{
                fontSize: "0.72rem",
                color: "primary.main",
                cursor: "pointer",
                width: "fit-content",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              + Add split shift
            </Box>
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.disabled" sx={{ pt: 0.5 }}>
          Closed
        </Typography>
      )}

      {/* Copy to all */}
      {schedule.isOpen && (
        <Tooltip title="Apply these hours to all days">
          <IconButton
            size="small"
            onClick={() => onCopyToAll(schedule)}
            sx={{ ml: "auto", color: "text.secondary" }}
          >
            <CopyIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OpeningHoursInput({ name }: { name: string }) {
  const [field, , helpers] = useField(name);

  // Ensure we always have a full week object
  const schedule: WeekSchedule = {
    ...DEFAULT_SCHEDULE,
    ...(field.value && typeof field.value === "object" ? field.value : {}),
  };

  const updateDay = (dayKey: string, updated: DaySchedule) => {
    helpers.setValue({ ...schedule, [dayKey]: updated });
  };

  const copyToAll = (source: DaySchedule) => {
    const next = DAYS.reduce((acc, d) => {
      acc[d.key] = { ...source };
      return acc;
    }, {} as WeekSchedule);
    helpers.setValue(next);
  };

  // Quick summary chips
  const openDays = DAYS.filter((d) => schedule[d.key]?.isOpen);
  const closedDays = DAYS.filter((d) => !schedule[d.key]?.isOpen);

  return (
    <Box>
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px !important",
          overflow: "hidden",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, minHeight: 52 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, flexWrap: "wrap" }}>
            <ClockIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" fontWeight={600}>
              Opening Hours
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              {openDays.length > 0 && (
                <Chip
                  label={`${openDays.length} day${openDays.length !== 1 ? "s" : ""} open`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 20 }}
                />
              )}
              {closedDays.length > 0 && (
                <Chip
                  label={closedDays.map((d) => d.short).join(", ") + " closed"}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 20, color: "text.secondary" }}
                />
              )}
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 0, px: 2, pb: 1 }}>
          {/* Quick presets */}
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
              Quick set:
            </Typography>
            {[
              {
                label: "Mon–Fri 9–9",
                apply: () => {
                  const next = { ...schedule };
                  DAYS.forEach((d) => {
                    next[d.key] = {
                      isOpen: !["saturday", "sunday"].includes(d.key),
                      slots: [{ open: "09:00", close: "21:00" }],
                    };
                  });
                  helpers.setValue(next);
                },
              },
              {
                label: "All Days 8–10",
                apply: () => {
                  const next = DAYS.reduce((acc, d) => {
                    acc[d.key] = { isOpen: true, slots: [{ open: "08:00", close: "22:00" }] };
                    return acc;
                  }, {} as WeekSchedule);
                  helpers.setValue(next);
                },
              },
              {
                label: "24/7",
                apply: () => {
                  const next = DAYS.reduce((acc, d) => {
                    acc[d.key] = { isOpen: true, slots: [{ open: "00:00", close: "23:59" }] };
                    return acc;
                  }, {} as WeekSchedule);
                  helpers.setValue(next);
                },
              },
            ].map((preset) => (
              <Chip
                key={preset.label}
                label={preset.label}
                size="small"
                variant="outlined"
                onClick={preset.apply}
                clickable
                sx={{ fontSize: "0.7rem", cursor: "pointer" }}
              />
            ))}
          </Box>

          {DAYS.map((d) => (
            <DayRow
              key={d.key}
              dayKey={d.key}
              label={d.label}
              schedule={schedule[d.key] || { isOpen: false, slots: [{ ...DEFAULT_SLOT }] }}
              onChange={(updated) => updateDay(d.key, updated)}
              onCopyToAll={copyToAll}
            />
          ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}