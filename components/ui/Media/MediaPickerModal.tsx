"use client";

import {
  useGetAllMediaQuery,
  useGetMediaFoldersQuery,
} from "@/features/media/mediaApiService";
import {
  AudioFile as AudioIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Description as DocIcon,
  GridView as GridViewIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  VideoFile as VideoIcon,
  ViewList as ViewListIcon
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  type: "image" | "video" | "audio" | "document";
  size: number;
  width?: number;
  height?: number;
  title?: string;
  alt?: string;
  folder?: string;
  tags?: string[];
  createdAt: string;
}

export interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  allowedTypes?: ("image" | "video" | "audio" | "document")[];
  title?: string;
  maxSelection?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon fontSize="small" />,
  video: <VideoIcon fontSize="small" />,
  audio: <AudioIcon fontSize="small" />,
  document: <DocIcon fontSize="small" />,
};

const TYPE_COLORS: Record<string, string> = {
  image: "#6366F1",
  video: "#8B5CF6",
  audio: "#10B981",
  document: "#F59E0B",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Grid Item ───────────────────────────────────────────────────────────────

function MediaGridItem({
  item,
  selected,
  onToggle,
}: {
  item: MediaItem;
  selected: boolean;
  onToggle: (item: MediaItem) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Box
      onClick={() => onToggle(item)}
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        border: "2px solid",
        borderColor: selected ? "primary.main" : "divider",
        transition: "all 0.15s ease",
        aspectRatio: "1",
        bgcolor: "background.accent",
        "&:hover": {
          borderColor: selected ? "primary.main" : "grey.500",
          transform: "scale(1.02)",
          "& .media-overlay": { opacity: 1 },
        },
      }}
    >
      {/* Thumbnail */}
      {item.type === "image" && !imgError ? (
        <Box
          component="img"
          src={item.thumbnailUrl || item.url}
          alt={item.alt || item.filename}
          onError={() => setImgError(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: TYPE_COLORS[item.type] || "#6366F1",
          }}
        >
          {React.cloneElement(TYPE_ICONS[item.type] as React.ReactElement, {
            sx: { fontSize: 36 },
          })}
          <Typography variant="caption" sx={{ opacity: 0.7, px: 1, textAlign: "center" }}>
            {item.filename.slice(0, 20)}
          </Typography>
        </Box>
      )}

      {/* Hover overlay */}
      <Box
        className="media-overlay"
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: alpha("#0F172A", 0.5),
          opacity: selected ? 1 : 0,
          transition: "opacity 0.15s ease",
          display: "flex",
          alignItems: "flex-end",
          p: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "white",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {item.title || item.filename}
        </Typography>
      </Box>

      {/* Type badge */}
      <Box
        sx={{
          position: "absolute",
          top: 6,
          left: 6,
          bgcolor: alpha(TYPE_COLORS[item.type] || "#6366F1", 0.85),
          borderRadius: 1,
          px: 0.5,
          py: 0.25,
          display: "flex",
          alignItems: "center",
          color: "white",
        }}
      >
        {TYPE_ICONS[item.type]}
      </Box>

      {/* Check icon */}
      {selected && (
        <CheckCircleIcon
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            color: "primary.main",
            bgcolor: "white",
            borderRadius: "50%",
            fontSize: 22,
          }}
        />
      )}
    </Box>
  );
}

// ─── List Item ────────────────────────────────────────────────────────────────

function MediaListItem({
  item,
  selected,
  onToggle,
}: {
  item: MediaItem;
  selected: boolean;
  onToggle: (item: MediaItem) => void;
}) {
  return (
    <Box
      onClick={() => onToggle(item)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? alpha("#6366F1", 0.08) : "transparent",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "primary.light",
          bgcolor: alpha("#6366F1", 0.06),
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 1.5,
          overflow: "hidden",
          flexShrink: 0,
          bgcolor: "background.accent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: TYPE_COLORS[item.type] || "#6366F1",
        }}
      >
        {item.type === "image" ? (
          <Box
            component="img"
            src={item.thumbnailUrl || item.url}
            alt={item.filename}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          React.cloneElement(TYPE_ICONS[item.type] as React.ReactElement, {
            sx: { fontSize: 28 },
          })
        )}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={500}
          noWrap
          sx={{ color: "text.primary" }}
        >
          {item.title || item.filename}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatBytes(item.size)} •{" "}
          {item.width && item.height
            ? `${item.width}×${item.height} • `
            : ""}
          {item.folder || "—"}
        </Typography>
      </Box>

      {/* Type chip */}
      <Chip
        label={item.type}
        size="small"
        sx={{
          bgcolor: alpha(TYPE_COLORS[item.type] || "#6366F1", 0.15),
          color: TYPE_COLORS[item.type] || "#6366F1",
          fontWeight: 600,
          fontSize: "0.65rem",
        }}
      />

      {/* Check */}
      {selected && (
        <CheckCircleIcon sx={{ color: "primary.main", fontSize: 20 }} />
      )}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes,
  title = "Select Media",
  maxSelection,
}: MediaPickerModalProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useGetAllMediaQuery({
    page,
    limit: 40,
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    folder: folderFilter !== "all" ? folderFilter : undefined,
    sortBy,
    sortOrder: "desc",
  });

  const { data: foldersData } = useGetMediaFoldersQuery({});

  // Reset selection on open
  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const handleToggle = useCallback(
    (item: MediaItem) => {
      setSelected((prev) => {
        const exists = prev.find((s) => s.id === item.id);
        if (exists) return prev.filter((s) => s.id !== item.id);
        if (!multiple) return [item];
        if (maxSelection && prev.length >= maxSelection) return prev;
        return [...prev, item];
      });
    },
    [multiple, maxSelection]
  );

  const handleConfirm = () => {
    if (selected.length === 0) return;
    onSelect(multiple ? selected : selected[0]);
    onClose();
  };

  const mediaItems: MediaItem[] = data?.data || [];
  const filteredItems = allowedTypes
    ? mediaItems.filter((m) => allowedTypes.includes(m.type as any))
    : mediaItems;

  const folders: { name: string; count: number }[] = foldersData || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "85vh",
          bgcolor: "background.paper",
          backgroundImage: "none",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
          px: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          {selected.length > 0 && (
            <Chip
              label={`${selected.length} selected`}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search media..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />

        {/* Type filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">All Types</MenuItem>
            {(allowedTypes || ["image", "video", "audio", "document"]).map(
              (t) => (
                <MenuItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        {/* Folder filter */}
        {folders.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Folder</InputLabel>
            <Select
              value={folderFilter}
              label="Folder"
              onChange={(e) => {
                setFolderFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="all">All Folders</MenuItem>
              {folders.map((f) => (
                <MenuItem key={f.name} value={f.name}>
                  {f.name} ({f.count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Sort</InputLabel>
          <Select
            value={sortBy}
            label="Sort"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="createdAt">Newest First</MenuItem>
            <MenuItem value="size">Size</MenuItem>
            <MenuItem value="filename">Name</MenuItem>
          </Select>
        </FormControl>

        {/* View toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
        >
          <ToggleButton value="grid">
            <GridViewIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => refetch()}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <DialogContent sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
        {isLoading || isFetching ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                viewMode === "grid"
                  ? "repeat(auto-fill, minmax(120px, 1fr))"
                  : "1fr",
              gap: 1.5,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={viewMode === "grid" ? 120 : 72}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : filteredItems.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 2,
              color: "text.secondary",
            }}
          >
            <ImageIcon sx={{ fontSize: 64, opacity: 0.3 }} />
            <Typography>No media found</Typography>
          </Box>
        ) : viewMode === "grid" ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 1.5,
            }}
          >
            {filteredItems.map((item) => (
              <MediaGridItem
                key={item.id}
                item={item}
                selected={!!selected.find((s) => s.id === item.id)}
                onToggle={handleToggle}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredItems.map((item) => (
              <MediaListItem
                key={item.id}
                item={item}
                selected={!!selected.find((s) => s.id === item.id)}
                onToggle={handleToggle}
              />
            ))}
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          px: 2.5,
          py: 1.5,
          gap: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {data?.meta?.total || 0} items
          {multiple && maxSelection
            ? ` • max ${maxSelection} selections`
            : ""}
          {!multiple ? " • Click to select" : " • Click to multi-select"}
        </Typography>
        <Button onClick={onClose} variant="outlined" size="small">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          size="small"
          disabled={selected.length === 0}
          startIcon={<CheckCircleIcon />}
        >
          {multiple
            ? `Select ${selected.length > 0 ? selected.length : ""} Item${selected.length !== 1 ? "s" : ""}`
            : "Select"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}