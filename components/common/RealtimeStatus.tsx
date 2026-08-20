"use client";

import { useRealtime } from "@/lib/RealtimeProvider";
import { Chip, Tooltip } from "@mui/material";

/**
 * Small badge that makes the realtime channel's state visible on a page.
 * When it is not "Live", the grid is still fully functional over REST —
 * it just stops updating on its own.
 */
export default function RealtimeStatus({ room }: { room?: string }) {
  const { status, rooms, lastEventAt, errorMessage } = useRealtime();

  const joined = !room || rooms.includes(room);
  const isLive = status === "connected" && joined;

  const label = isLive
    ? "Live"
    : status === "connecting"
      ? "Connecting…"
      : status === "reconnecting"
        ? "Reconnecting…"
        : status === "unauthorized"
          ? "Live updates unavailable"
          : status === "connected" && !joined
            ? "Live updates unavailable"
            : "Offline";

  const tooltip = isLive
    ? lastEventAt
      ? `Live updates on. Last update ${new Date(lastEventAt).toLocaleTimeString()}.`
      : "Live updates on. Waiting for activity."
    : status === "unauthorized" || (status === "connected" && !joined)
      ? errorMessage ||
        "Your account cannot receive live updates for this screen. The list still refreshes normally."
      : "Live updates are temporarily unavailable. The list still loads and refreshes normally.";

  return (
    <Tooltip title={tooltip} arrow>
      <Chip
        size="small"
        label={label}
        sx={{
          fontWeight: 800,
          fontSize: "0.7rem",
          letterSpacing: "0.02em",
          bgcolor: isLive ? "#D1FAE5" : "#F1F5F9",
          color: isLive ? "#059669" : "#64748B",
          "& .MuiChip-label": { px: 1.25 },
          "&::before": {
            content: '""',
            display: "inline-block",
            width: 7,
            height: 7,
            borderRadius: "50%",
            ml: 1,
            bgcolor: isLive ? "#10B981" : "#94A3B8",
            animation: isLive ? "aimkPulse 1.8s ease-in-out infinite" : "none",
          },
          "@keyframes aimkPulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.25 },
          },
        }}
      />
    </Tooltip>
  );
}
