"use client";

import TableComponent from "@/components/common/DataTable";
import {
  useGetCakeCustomizationsQuery,
  useUpdateCakeCustomizationMutation,
} from "@/features/cake-customization/cakeApiService";
import { useGetAllOutletsQuery } from "@/features/outlets/outletsApiService";
import { MEDIA_BASE_URL } from "@/utils/constants";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  NEW: { bg: "#FEF3C7", color: "#D97706", label: "NEW" },
  CONTACTED: { bg: "#DBEAFE", color: "#2563EB", label: "CONTACTED" },
  QUOTED: { bg: "#F3E8FF", color: "#7C3AED", label: "QUOTED" },
  CONFIRMED: { bg: "#D1FAE5", color: "#059669", label: "CONFIRMED" },
  CANCELLED: { bg: "#FEE2E2", color: "#DC2626", label: "CANCELLED" },
};

export default function CakeCustomizationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // Queries & Mutations
  const { data, isLoading } = useGetCakeCustomizationsQuery({
    page,
    limit,
    status: statusFilter || undefined,
  });

  const { data: outletsData } = useGetAllOutletsQuery({ page: 1, limit: 100 });
  const [updateRequest, { isLoading: isUpdating }] = useUpdateCakeCustomizationMutation();

  const handleOpenDetail = (row: any) => {
    setSelectedRequest(row);
    setAdminNotes(row.adminNotes || "");
    setSelectedOutletId(row.assignedOutletId || "");
    setEditStatus(row.status || "NEW");
  };

  const handleCloseDetail = () => {
    setSelectedRequest(null);
  };

  const handleSaveUpdate = async () => {
    if (!selectedRequest) return;
    try {
      await updateRequest({
        id: selectedRequest.id,
        status: editStatus,
        adminNotes: adminNotes || undefined,
        assignedOutletId: selectedOutletId || undefined,
      }).unwrap();
      handleCloseDetail();
    } catch (err) {
      console.error("Failed to update request:", err);
    }
  };

  const handleInlineStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateRequest({ id, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "refNumber",
        headerName: "Ref No",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: "#1E293B" }}>
            {row.refNumber}
          </Typography>
        ),
      },
      {
        field: "name",
        headerName: "Customer",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              {row.phone}
            </Typography>
          </Box>
        ),
      },
      {
        field: "occasion",
        headerName: "Occasion",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.occasion}
          </Typography>
        ),
      },
      {
        field: "size",
        headerName: "Size",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Chip label={row.size} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
        ),
      },
      {
        field: "contactPreference",
        headerName: "Channel",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Chip
            icon={row.contactPreference === "WHATSAPP" ? <WhatsAppIcon sx={{ fontSize: 16 }} /> : undefined}
            label={row.contactPreference}
            size="small"
            sx={{
              bgcolor: row.contactPreference === "WHATSAPP" ? "#DCFCE7" : "#F1F5F9",
              color: row.contactPreference === "WHATSAPP" ? "#166534" : "#475569",
              fontWeight: 700,
            }}
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Select
            size="small"
            value={row.status}
            onChange={(e) => handleInlineStatusChange(row.id, e.target.value)}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              bgcolor: STATUS_COLORS[row.status]?.bg || "#F1F5F9",
              color: STATUS_COLORS[row.status]?.color || "#334155",
            }}
          >
            <MenuItem value="NEW">NEW</MenuItem>
            <MenuItem value="CONTACTED">CONTACTED</MenuItem>
            <MenuItem value="QUOTED">QUOTED</MenuItem>
            <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
          </Select>
        ),
      },
      {
        field: "createdAt",
        headerName: "Date",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {new Date(row.createdAt).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Manage",
        flex: 0.6,
        renderCell: ({ row }: any) => (
          <Button
            size="small"
            variant="outlined"
            startIcon={<FaEdit size={14} />}
            onClick={() => handleOpenDetail(row)}
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <Box className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h2">Cake Customization Requests</Typography>
      </div>

      {/* Filter Section */}
      <Paper className="mb-4 p-4">
        <div className="flex gap-4 items-center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="NEW">NEW</MenuItem>
              <MenuItem value="CONTACTED">CONTACTED</MenuItem>
              <MenuItem value="QUOTED">QUOTED</MenuItem>
              <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Items per page</InputLabel>
            <Select
              value={limit}
              label="Items per page"
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>

          {statusFilter && (
            <Button variant="text" color="secondary" onClick={() => setStatusFilter("")}>
              Clear Filter
            </Button>
          )}
        </div>
      </Paper>

      {/* Data Table */}
      <TableComponent
        columns={columns}
        data={data?.data || []}
        currentPage={page}
        setCurrentPage={setPage}
        pageSize={limit}
        totalItems={data?.meta?.totalItems || 0}
        isLoading={isLoading}
      />

      {/* Detail & Management Dialog */}
      <Dialog open={Boolean(selectedRequest)} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Request: {selectedRequest.refNumber}</span>
              <Chip
                label={editStatus}
                sx={{
                  bgcolor: STATUS_COLORS[editStatus]?.bg,
                  color: STATUS_COLORS[editStatus]?.color,
                  fontWeight: 800,
                }}
              />
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container spacing={3}>
                {/* Customer Details */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                    Customer Contact Info
                  </Typography>
                  <Typography variant="body2"><strong>Name:</strong> {selectedRequest.name}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedRequest.phone}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedRequest.email || "N/A"}</Typography>
                  <Typography variant="body2"><strong>Preferred Channel:</strong> {selectedRequest.contactPreference}</Typography>
                </Grid>

                {/* Delivery Address */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                    Delivery Location
                  </Typography>
                  <Typography variant="body2"><strong>Address:</strong> {selectedRequest.deliveryAddress || "Not provided"}</Typography>
                  <Typography variant="body2"><strong>City:</strong> {selectedRequest.city || "N/A"}</Typography>
                  <Typography variant="body2"><strong>Pincode:</strong> {selectedRequest.pincode || "N/A"}</Typography>
                </Grid>

                <Grid size={{ xs: 12 }}><Divider /></Grid>

                {/* Cake Specs */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                    Cake Specifications
                  </Typography>
                  <Typography variant="body2"><strong>Occasion:</strong> {selectedRequest.occasion}</Typography>
                  <Typography variant="body2"><strong>Size:</strong> {selectedRequest.size}</Typography>
                  <Typography variant="body2"><strong>Preferred Date:</strong> {selectedRequest.preferredDeliveryDate ? new Date(selectedRequest.preferredDeliveryDate).toLocaleDateString() : "Flexible"}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Flavors:</Typography>
                    {selectedRequest.flavors?.map((flv: string) => (
                      <Chip key={flv} label={flv} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                    ))}
                  </Box>
                </Grid>

                {/* Design Notes */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                    Design Notes & Instructions
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#F8FAFC" }}>
                    <Typography variant="body2" sx={{ fontStyle: selectedRequest.designNotes ? "normal" : "italic" }}>
                      {selectedRequest.designNotes || "No specific instructions provided."}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Reference Images */}
                {selectedRequest.referenceImageKeys?.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                      Uploaded Reference Images
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                      {selectedRequest.referenceImageKeys.map((key: string, idx: number) => {
                        const imgUrl = `${MEDIA_BASE_URL}${key}`;
                        return (
                          <Box key={idx} component="a" href={imgUrl} target="_blank" sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #CBD5E1" }}>
                            <img src={imgUrl} alt={`Reference ${idx + 1}`} style={{ width: 100, height: 100, objectFit: "cover" }} />
                          </Box>
                        );
                      })}
                    </Box>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}><Divider /></Grid>

                {/* Admin Operations Form */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Update Status</InputLabel>
                    <Select
                      value={editStatus}
                      label="Update Status"
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <MenuItem value="NEW">NEW</MenuItem>
                      <MenuItem value="CONTACTED">CONTACTED</MenuItem>
                      <MenuItem value="QUOTED">QUOTED</MenuItem>
                      <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                      <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Assign Bakery Outlet</InputLabel>
                    <Select
                      value={selectedOutletId}
                      label="Assign Bakery Outlet"
                      onChange={(e) => setSelectedOutletId(e.target.value)}
                    >
                      <MenuItem value="">None / Unassigned</MenuItem>
                      {outletsData?.data?.map((outlet: any) => (
                        <MenuItem key={outlet.id} value={outlet.id}>
                          {outlet.name} ({outlet.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Internal Admin Notes"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="e.g. Quoted 3500 INR. Spoke with customer on WhatsApp."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<WhatsAppIcon />}
                onClick={() => {
                  const waText = encodeURIComponent(
                    `Hello ${selectedRequest.name}, regarding your Custom Cake Request ${selectedRequest.refNumber} at Angels in My Kitchen...`
                  );
                  window.open(`https://wa.me/91${selectedRequest.phone.replace(/[^0-9]/g, "")}?text=${waText}`, "_blank");
                }}
              >
                Chat with Customer on WhatsApp
              </Button>

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button onClick={handleCloseDetail}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveUpdate} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
