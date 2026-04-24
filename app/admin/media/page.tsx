"use client";

import {
  useBulkDeleteMediaMutation,
  useDeleteMediaMutation,
  useGetAllMediaQuery,
  useGetMediaFoldersQuery,
  useUpdateMediaMetaDataMutation,
  useUploadMediaMutation,
} from "@/features/media/mediaApiService";
import {
  Add as AddIcon,
  AudioFile as AudioIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  FolderOpen as FolderIcon,
  Folder as FolderTagIcon,
  GridView as GridViewIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  RotateRight as RotateIcon,
  Search as SearchIcon,
  VideoFile as VideoIcon,
  ViewList as ViewListIcon,
  ZoomOutMap as ZoomFitIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from "@mui/icons-material";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
  Select,
  Skeleton,
  Slider,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaItem {
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
  uploadedBy?: string;
  isPublic?: boolean;
  key?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon />,
  video: <VideoIcon />,
  audio: <AudioIcon />,
  document: <DocIcon />,
};

const TYPE_COLORS: Record<string, string> = {
  image: "#6366F1",
  video: "#8B5CF6",
  audio: "#10B981",
  document: "#F59E0B",
};

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({
  onFiles,
  uploading,
  progress,
}: {
  onFiles: (files: File[], folder: string, meta: any) => void;
  uploading: boolean;
  progress: number;
}) {
  const [dragging, setDragging] = useState(false);
  const [folder, setFolder] = useState("general");
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [tags, setTags] = useState("");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URLs when files are staged
  useEffect(() => {
    const urls = stagedFiles.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : ""
    );
    setPreviews(urls);
    return () => urls.forEach((u) => u && URL.revokeObjectURL(u));
  }, [stagedFiles]);

  const stageFiles = (files: File[]) => {
    setStagedFiles(files);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) stageFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) stageFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (stagedFiles.length === 0) return;
    onFiles(stagedFiles, folder, {
      title,
      alt,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    // Clear after upload
    setStagedFiles([]);
    setTitle("");
    setAlt("");
    setTags("");
    setFolder("general");
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <VideoIcon sx={{ fontSize: 32, color: TYPE_COLORS.video }} />;
    if (file.type.startsWith("audio/")) return <AudioIcon sx={{ fontSize: 32, color: TYPE_COLORS.audio }} />;
    return <DocIcon sx={{ fontSize: 32, color: TYPE_COLORS.document }} />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CloudUploadIcon sx={{ color: "primary.main" }} />
          Upload Media
        </Typography>

        {/* Drop zone — only show when no files staged */}
        {stagedFiles.length === 0 && (
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: dragging ? "primary.main" : "divider",
              borderRadius: 2,
              p: 4,
              mb: 2.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              cursor: "pointer",
              bgcolor: dragging ? alpha("#6366F1", 0.06) : alpha("#1E293B", 0.4),
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.light",
                bgcolor: alpha("#6366F1", 0.04),
              },
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={handleFileInput}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
            />
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: alpha("#6366F1", 0.12),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box textAlign="center">
              <Typography variant="body1" fontWeight={500}>
                Drop files here or{" "}
                <Typography component="span" color="primary.main" fontWeight={600}>
                  browse
                </Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Images, videos, audio, and documents up to 50MB
              </Typography>
            </Box>
          </Box>
        )}

        {/* Staged file previews */}
        {stagedFiles.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {stagedFiles.length} file{stagedFiles.length > 1 ? "s" : ""} ready to upload
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<AddIcon />}
              >
                Add more
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  if (newFiles.length > 0)
                    setStagedFiles((prev) => [...prev, ...newFiles]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 1.5,
              }}
            >
              {stagedFiles.map((file, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.accent",
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {previews[i] ? (
                    <Box
                      component="img"
                      src={previews[i]}
                      alt={file.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.5,
                        p: 1,
                      }}
                    >
                      {getFileIcon(file)}
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ maxWidth: "100%", fontSize: "0.6rem", color: "text.secondary" }}
                      >
                        {file.name}
                      </Typography>
                    </Box>
                  )}

                  {/* Size badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: alpha("#0F172A", 0.75),
                      px: 0.75,
                      py: 0.4,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.6rem" }}
                      noWrap
                    >
                      {formatBytes(file.size)}
                    </Typography>
                  </Box>

                  {/* Remove button */}
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(i)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      width: 20,
                      height: 20,
                      bgcolor: alpha("#0F172A", 0.7),
                      color: "white",
                      "&:hover": { bgcolor: "error.main" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Upload progress */}
        {uploading && (
          <Box mb={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Uploading...</Typography>
              <Typography variant="caption" color="primary.main" fontWeight={600}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha("#6366F1", 0.15),
                "& .MuiLinearProgress-bar": { borderRadius: 3 },
              }}
            />
          </Box>
        )}

        {/* Meta fields — always visible so user can pre-fill before selecting */}
        <Grid container spacing={2} sx={{ mb: stagedFiles.length > 0 ? 2 : 0 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              label="Folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="general"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FolderIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              label="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              label="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2"
            />
          </Grid>
        </Grid>

        {/* Upload button — only show when files are staged */}
        {stagedFiles.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setStagedFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading
                ? `Uploading... ${progress}%`
                : `Upload ${stagedFiles.length} File${stagedFiles.length > 1 ? "s" : ""}`}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Image Viewer ─────────────────────────────────────────────────────────────

function ImageViewer({ url, alt }: { url: string; alt?: string }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    setPan({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(5, z - e.deltaY * 0.001)));
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Box>
      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          px: 1,
        }}
      >
        <Tooltip title="Zoom Out">
          <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Slider
          size="small"
          min={50}
          max={500}
          value={Math.round(zoom * 100)}
          onChange={(_, v) => setZoom((v as number) / 100)}
          sx={{ width: 120 }}
        />
        <Tooltip title="Zoom In">
          <IconButton size="small" onClick={() => setZoom((z) => Math.min(5, z + 0.25))}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
          {Math.round(zoom * 100)}%
        </Typography>
        <Tooltip title="Rotate">
          <IconButton size="small" onClick={() => setRotation((r) => (r + 90) % 360)}>
            <RotateIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset">
          <IconButton size="small" onClick={resetView}>
            <ZoomFitIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Open Original">
          <IconButton
            size="small"
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Canvas */}
      <Box
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        sx={{
          width: "100%",
          height: 360,
          overflow: "hidden",
          borderRadius: 2,
          bgcolor: alpha("#0F172A", 0.6),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
      >
        <Box
          component="img"
          src={url}
          alt={alt}
          sx={{
            maxWidth: "90%",
            maxHeight: "90%",
            objectFit: "contain",
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: dragging ? "none" : "transform 0.15s ease",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Media Detail Drawer ──────────────────────────────────────────────────────

function MediaDetailDialog({
  item,
  open,
  onClose,
  onDelete,
  onUpdate,
}: {
  item: MediaItem | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", alt: "", tags: "", folder: "" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || "",
        alt: item.alt || "",
        tags: (item.tags || []).join(", "),
        folder: item.folder || "",
      });
    }
  }, [item]);

  const handleCopyUrl = async () => {
    if (!item) return;
    await navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!item) return;
    onUpdate(item.id, {
      title: form.title,
      alt: form.alt,
      folder: form.folder,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { bgcolor: "background.paper", backgroundImage: "none" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={600} noWrap sx={{ maxWidth: "80%" }}>
          {item.title || item.filename}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={item.type}
            size="small"
            sx={{
              bgcolor: alpha(TYPE_COLORS[item.type] || "#6366F1", 0.15),
              color: TYPE_COLORS[item.type] || "#6366F1",
              fontWeight: 600,
            }}
          />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          {/* Preview */}
          <Grid item xs={12} md={7}>
            {item.type === "image" ? (
              <ImageViewer url={item.url} alt={item.alt} />
            ) : item.type === "video" ? (
              <Box
                component="video"
                src={item.url}
                controls
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  bgcolor: "#000",
                  maxHeight: 360,
                }}
              />
            ) : item.type === "audio" ? (
              <Box
                sx={{
                  bgcolor: alpha("#10B981", 0.08),
                  borderRadius: 2,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <AudioIcon sx={{ fontSize: 56, color: "#10B981" }} />
                <Box component="audio" src={item.url} controls sx={{ width: "100%" }} />
              </Box>
            ) : (
              <Box
                sx={{
                  bgcolor: alpha("#F59E0B", 0.08),
                  borderRadius: 2,
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  color: "#F59E0B",
                }}
              >
                <DocIcon sx={{ fontSize: 56 }} />
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderColor: "#F59E0B", color: "#F59E0B" }}
                >
                  Open Document
                </Button>
              </Box>
            )}

            {/* URL copy */}
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: "background.accent",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "text.secondary",
                  fontFamily: "monospace",
                }}
              >
                {item.url}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy URL"}>
                <IconButton size="small" onClick={handleCopyUrl}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Open in new tab">
                <IconButton
                  size="small"
                  component="a"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          {/* Meta info + Edit */}
          <Grid item xs={12} md={5}>
            {/* Stats */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary" gutterBottom display="block">
                File Info
              </Typography>
              {[
                { label: "Size", value: formatBytes(item.size) },
                { label: "Type", value: item.mimeType },
                { label: "Folder", value: item.folder || "—" },
                ...(item.width && item.height
                  ? [{ label: "Dimensions", value: `${item.width} × ${item.height}` }]
                  : []),
                { label: "Uploaded", value: timeAgo(item.createdAt) },
                { label: "Public", value: item.isPublic ? "Yes" : "No" },
              ].map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.75,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {row.label}
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Tags */}
            {(item.tags || []).length > 0 && !editing && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary" gutterBottom display="block">
                  Tags
                </Typography>
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                  {(item.tags || []).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Edit form */}
            {editing ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Edit Metadata
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  label="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Alt Text"
                  value={form.alt}
                  onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  multiline
                  rows={2}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Folder"
                  value={form.folder}
                  onChange={(e) => setForm({ ...form, folder: e.target.value })}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Tags (comma separated)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          px: 2.5,
          py: 1.5,
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={() => {
            onDelete(item.id);
            onClose();
          }}
        >
          Delete
        </Button>
        <Box sx={{ flex: 1 }} />
        {editing ? (
          <>
            <Button size="small" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={handleSave}>
              Save Changes
            </Button>
          </>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
          >
            Edit Metadata
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Media Card ───────────────────────────────────────────────────────────────

function MediaCard({
  item,
  selected,
  onSelect,
  onOpen,
  onDelete,
}: {
  item: MediaItem;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [imgError, setImgError] = useState(false);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        border: "2px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: "background.accent",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: selected ? "primary.main" : "grey.500",
          "& .card-overlay": { opacity: 1 },
          "& .card-menu": { opacity: 1 },
        },
        aspectRatio: "1",
      }}
      onClick={onOpen}
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
      ) : item.type === "video" ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: TYPE_COLORS.video,
          }}
        >
          <VideoIcon sx={{ fontSize: 40 }} />
          <Typography variant="caption" noWrap sx={{ px: 1 }}>
            {item.filename}
          </Typography>
        </Box>
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
            sx: { fontSize: 40 },
          })}
          <Typography variant="caption" noWrap sx={{ px: 1 }}>
            {item.filename}
          </Typography>
        </Box>
      )}

      {/* Hover overlay */}
      <Box
        className="card-overlay"
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(15,23,42,0.85) 40%, transparent 100%)",
          opacity: selected ? 1 : 0,
          transition: "opacity 0.15s ease",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          p: 1.25,
        }}
      >
        <Typography variant="caption" noWrap color="white" fontWeight={500}>
          {item.title || item.filename}
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
          {formatBytes(item.size)}
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
          px: 0.75,
          py: 0.25,
          display: "flex",
          alignItems: "center",
          color: "white",
          backdropFilter: "blur(4px)",
        }}
      >
        {React.cloneElement(TYPE_ICONS[item.type] as React.ReactElement, {
          sx: { fontSize: 14 },
        })}
      </Box>

      {/* Select checkbox */}
      <Box
        className="card-menu"
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          opacity: selected ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          sx={{
            color: selected ? "primary.main" : "white",
            bgcolor: alpha("#0F172A", 0.6),
            "&:hover": { bgcolor: alpha("#0F172A", 0.8) },
            width: 28,
            height: 28,
          }}
        >
          {selected ? (
            <CheckBoxIcon sx={{ fontSize: 16 }} />
          ) : (
            <CheckBoxOutlineBlankIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      </Box>

      {/* More menu */}
      <Box
        sx={{
          position: "absolute",
          bottom: 6,
          right: 6,
          opacity: 0,
          transition: "opacity 0.15s ease",
          ".MuiBox-root:hover &": { opacity: 1 },
        }}
      >
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            color: "white",
            bgcolor: alpha("#0F172A", 0.6),
            "&:hover": { bgcolor: alpha("#0F172A", 0.8) },
            width: 24,
            height: 24,
          }}
        >
          <MoreVertIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={(e: any) => { e?.stopPropagation?.(); setMenuAnchor(null); }}
        PaperProps={{ sx: { minWidth: 140 } }}
      >
        <MenuItem
          dense
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
            setMenuAnchor(null);
          }}
        >
          <InfoIcon sx={{ fontSize: 16, mr: 1 }} /> Details
        </MenuItem>
        <MenuItem
          dense
          component="a"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e: any) => { e.stopPropagation(); setMenuAnchor(null); }}
        >
          <DownloadIcon sx={{ fontSize: 16, mr: 1 }} /> Download
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            setMenuAnchor(null);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

// ─── Media List Row ───────────────────────────────────────────────────────────

function MediaListRow({
  item,
  selected,
  onSelect,
  onOpen,
  onDelete,
}: {
  item: MediaItem;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? alpha("#6366F1", 0.06) : "transparent",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": { bgcolor: alpha("#6366F1", 0.04), borderColor: "primary.light" },
      }}
    >
      {/* Select */}
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        sx={{ color: selected ? "primary.main" : "text.disabled" }}
      >
        {selected ? <CheckBoxIcon sx={{ fontSize: 18 }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />}
      </IconButton>

      {/* Thumb */}
      <Box
        onClick={onOpen}
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1.5,
          overflow: "hidden",
          flexShrink: 0,
          bgcolor: "background.surface",
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
          />
        ) : (
          React.cloneElement(TYPE_ICONS[item.type] as React.ReactElement, {
            sx: { fontSize: 24 },
          })
        )}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }} onClick={onOpen}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {item.title || item.filename}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.filename}
        </Typography>
      </Box>

      {/* Meta */}
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          gap: 2,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Chip
          label={item.type}
          size="small"
          sx={{
            bgcolor: alpha(TYPE_COLORS[item.type] || "#6366F1", 0.12),
            color: TYPE_COLORS[item.type] || "#6366F1",
            fontWeight: 600,
            fontSize: "0.65rem",
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
          {formatBytes(item.size)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
          {timeAgo(item.createdAt)}
        </Typography>
        {item.folder && (
          <Chip
            label={item.folder}
            size="small"
            variant="outlined"
            icon={<FolderTagIcon sx={{ fontSize: "12px !important" }} />}
            sx={{ maxWidth: 120, fontSize: "0.65rem" }}
          />
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
        <Tooltip title="Details">
          <IconButton size="small" onClick={onOpen}>
            <InfoIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tab, setTab] = useState(0);

  // RTK Query
  const queryParams = {
    page,
    limit: 40,
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    folder: folderFilter !== "all" ? folderFilter : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllMediaQuery(queryParams);
  const { data: foldersData } = useGetMediaFoldersQuery({});
  const [uploadMedia, { isLoading: uploading }] = useUploadMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [bulkDeleteMedia, { isLoading: bulkDeleting }] = useBulkDeleteMediaMutation();
  const [updateMediaMetaData] = useUpdateMediaMetaDataMutation();

  const mediaItems: MediaItem[] = data?.data || [];
  const totalPages: number = data?.meta?.totalPages || 1;
  const totalItems: number = data?.meta?.total || 0;
  const folders: { name: string; count: number }[] = foldersData || [];

  // Upload handler
  const handleUpload = async (
    files: File[],
    folder: string,
    meta: { title?: string; alt?: string; tags?: string[] }
  ) => {
    setUploadProgress(10);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("folder", folder);
    if (meta.title) formData.append("title", meta.title);
    if (meta.alt) formData.append("alt", meta.alt);
    if (meta.tags) formData.append("tags", JSON.stringify(meta.tags));

    try {
      // Fake progress
      const interval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 15, 85));
      }, 300);
      await uploadMedia(formData).unwrap();
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1200);
      setToast({ msg: `${files.length} file(s) uploaded successfully`, type: "success" });
    } catch {
      setUploadProgress(0);
      setToast({ msg: "Upload failed. Please try again.", type: "error" });
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await deleteMedia({ id }).unwrap();
      setToast({ msg: "File deleted", type: "success" });
      setSelectedIds((prev) => prev.filter((s) => s !== id));
    } catch {
      setToast({ msg: "Delete failed", type: "error" });
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteMedia({ ids: selectedIds }).unwrap();
      setToast({ msg: `${selectedIds.length} files deleted`, type: "success" });
      setSelectedIds([]);
    } catch {
      setToast({ msg: "Bulk delete failed", type: "error" });
    }
  };

  // Update
  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateMediaMetaData({ id, body: data }).unwrap();
      setToast({ msg: "Metadata updated", type: "success" });
    } catch {
      setToast({ msg: "Update failed", type: "error" });
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === mediaItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mediaItems.map((m) => m.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: "auto" }}>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            Media Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalItems} files across {folders.length} folders
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Tab label="All Media" />
        <Tab label="Upload" />
      </Tabs>

      {/* Tab: Upload */}
      {tab === 1 && (
        <UploadZone
          onFiles={handleUpload}
          uploading={uploading}
          progress={uploadProgress}
        />
      )}

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2.5,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Search media..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 200, maxWidth: 320 }}
        />

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="image">Images</MenuItem>
            <MenuItem value="video">Videos</MenuItem>
            <MenuItem value="audio">Audio</MenuItem>
            <MenuItem value="document">Documents</MenuItem>
          </Select>
        </FormControl>

        {folders.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Folder</InputLabel>
            <Select
              value={folderFilter}
              label="Folder"
              onChange={(e) => { setFolderFilter(e.target.value); setPage(1); }}
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

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="createdAt">Date</MenuItem>
            <MenuItem value="size">Size</MenuItem>
            <MenuItem value="filename">Name</MenuItem>
          </Select>
        </FormControl>

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

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2,
            py: 1.5,
            mb: 2,
            borderRadius: 2,
            bgcolor: alpha("#6366F1", 0.1),
            border: "1px solid",
            borderColor: alpha("#6366F1", 0.3),
          }}
        >
          <CheckCircleIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {selectedIds.length} selected
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            size="small"
            variant="outlined"
            onClick={handleSelectAll}
          >
            {selectedIds.length === mediaItems.length ? "Deselect All" : "Select All"}
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
          >
            {bulkDeleting ? "Deleting..." : `Delete (${selectedIds.length})`}
          </Button>
        </Box>
      )}

      {/* Loading */}
      {(isLoading || isFetching) && (
        <LinearProgress
          sx={{
            mb: 2,
            borderRadius: 1,
            bgcolor: alpha("#6366F1", 0.1),
            "& .MuiLinearProgress-bar": { borderRadius: 1 },
          }}
        />
      )}

      {/* Media Grid */}
      {!isLoading && mediaItems.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 2,
            color: "text.secondary",
          }}
        >
          <ImageIcon sx={{ fontSize: 72, opacity: 0.2 }} />
          <Typography variant="h6" fontWeight={500} sx={{ opacity: 0.5 }}>
            No media found
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setTab(1)}
          >
            Upload First File
          </Button>
        </Box>
      ) : viewMode === "grid" ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 1.5,
          }}
        >
          {isLoading
            ? Array.from({ length: 16 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  sx={{ borderRadius: 2, aspectRatio: "1" }}
                />
              ))
            : mediaItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onSelect={() => handleToggleSelect(item.id)}
                  onOpen={() => {
                    setDetailItem(item);
                    setDetailOpen(true);
                  }}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
              ))
            : mediaItems.map((item) => (
                <MediaListRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onSelect={() => handleToggleSelect(item.id)}
                  onOpen={() => {
                    setDetailItem(item);
                    setDetailOpen(true);
                  }}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mt: 4,
            flexWrap: "wrap",
          }}
        >
          <Button
            size="small"
            variant="outlined"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size="small"
              variant={p === page ? "contained" : "outlined"}
              onClick={() => setPage(p)}
              sx={{ minWidth: 36 }}
            >
              {p}
            </Button>
          ))}
          <Button
            size="small"
            variant="outlined"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Detail Dialog */}
      <MediaDetailDialog
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.type}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}