"use client";

import {
  ORDER_STATUSES,
  getOrderStatusConfig,
  isKnownOrderStatus,
} from "@/utils/orderStatus";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface OrderStatusSelectProps {
  value?: string | null;
  onChange: (status: string) => void;
  disabled?: boolean;
  size?: "small" | "medium";
  label?: string;
  fullWidth?: boolean;
  minWidth?: number;
}

/**
 * The single status dropdown used by both the orders grid and the order detail
 * page, so the two can never drift apart again. Options come from the canonical
 * list, which mirrors the Prisma `OrderStatus` enum.
 */
export default function OrderStatusSelect({
  value,
  onChange,
  disabled,
  size = "small",
  label,
  fullWidth,
  minWidth,
}: OrderStatusSelectProps) {
  const current = value ? String(value).toLowerCase() : "";
  // A status the backend added but this build doesn't know about would render as
  // an empty box; surface it as a disabled option instead of losing it.
  const isUnknown = Boolean(current) && !isKnownOrderStatus(current);

  const select = (
    <Select
      size={size}
      value={current}
      label={label}
      onChange={(e) => onChange(e.target.value as string)}
      disabled={disabled}
      sx={{ borderRadius: 2, ...(minWidth ? { minWidth } : {}) }}
    >
      {isUnknown && (
        <MenuItem value={current} disabled>
          {getOrderStatusConfig(current).label}
        </MenuItem>
      )}
      {ORDER_STATUSES.map((s) => (
        <MenuItem key={s.value} value={s.value}>
          {s.label}
        </MenuItem>
      ))}
    </Select>
  );

  if (!label) return select;

  return (
    <FormControl size={size} fullWidth={fullWidth} sx={minWidth ? { minWidth } : undefined}>
      <InputLabel>{label}</InputLabel>
      {select}
    </FormControl>
  );
}
