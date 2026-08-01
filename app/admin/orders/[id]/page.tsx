"use client";

import {
  useAssignOrderOutletMutation,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/features/order/orderApiService";
import { useGetAllOutletsQuery } from "@/features/outlets/outletsApiService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_CHIPS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#FEF3C7", color: "#D97706" },
  confirmed: { bg: "#DBEAFE", color: "#2563EB" },
  processing: { bg: "#E0E7FF", color: "#4F46E5" },
  delivered: { bg: "#D1FAE5", color: "#059669" },
  cancelled: { bg: "#FEE2E2", color: "#DC2626" },
  refunded: { bg: "#FEE2E2", color: "#DC2626" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { data: rawOrderData, isLoading, error } = useGetAdminOrderQuery({ id: orderId });
  const { data: outletsData } = useGetAllOutletsQuery({ page: 1, limit: 100 });
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [assignOutlet, { isLoading: isAssigningOutlet }] = useAssignOrderOutletMutation();

  const [selectedOutletId, setSelectedOutletId] = useState<string>("");
  const [snackMsg, setSnackMsg] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const order = rawOrderData?.data || rawOrderData;

  if (error || !order || typeof order !== "object" || !order.id) {
    return (
      <Box className="p-6">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load order details or order not found.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/admin/orders")} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  const outlets = outletsData?.data || outletsData || [];
  const currentOutletId = order.outletId || selectedOutletId;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
      setSnackMsg(`Order status updated to ${newStatus.toUpperCase()}`);
      setSnackOpen(true);
    } catch {
      setSnackMsg("Failed to update order status");
      setSnackOpen(true);
    }
  };

  const handleReassignOutlet = async () => {
    if (!selectedOutletId) return;
    try {
      await assignOutlet({ id: orderId, outletId: selectedOutletId }).unwrap();
      setSnackMsg("Bakery outlet assigned successfully!");
      setSnackOpen(true);
    } catch {
      setSnackMsg("Failed to assign bakery outlet");
      setSnackOpen(true);
    }
  };

  const statusStr = typeof order.status === "string" ? order.status.toLowerCase() : "pending";
  const statusStyle = STATUS_CHIPS[statusStr] || { bg: "#F1F5F9", color: "#334155" };
  const user = order.customer?.user;
  const deliveryAddress = order.deliveryAddress;
  const isCod = order.paymentMethod === "COD" || (Array.isArray(order.payments) && order.payments[0]?.method?.toLowerCase() === "cod");

  return (
    <Box className="p-6">
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push("/admin/orders")}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            ← Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A" }}>
              Order #{order.orderNumber}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Placed on {new Date(order.placedAt || order.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={statusStr.toUpperCase()}
            sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 800, px: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Update Status</InputLabel>
            <Select
              value={statusStr}
              label="Update Status"
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column — Line Items & Financial Breakdown */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Line Items Table */}
          <Paper sx={{ borderRadius: 3, p: 3, mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Order Line Items ({order.items?.length || 0})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.product?.name || item.name || "Bakery Item"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          SKU: {item.product?.sku || item.sku || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">₹{Number(item.price || item.unitPrice).toFixed(2)}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ₹{(Number(item.price || item.unitPrice) * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />

            {/* Financial Summary */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, ml: "auto", maxWidth: 320 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ₹{Number(order.subtotal).toFixed(2)}
                </Typography>
              </Box>

              {Number(order.gstAmount) > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    GST Tax
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₹{Number(order.gstAmount).toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Delivery Fee
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ₹{Number(order.deliveryFee).toFixed(2)}
                </Typography>
              </Box>

              {Number(order.discountTotal) > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="success.main">
                    Promo Discount ({order.promoCode})
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    -₹{Number(order.discountTotal).toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 0.5 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Grand Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                  ₹{Number(order.grandTotal).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column — Customer, Outlet Assignment, Payment */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Fulfilment Outlet Assignment Card */}
          <Paper sx={{ borderRadius: 3, p: 3, mb: 3, border: "2px solid #E2E8F0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <StorefrontIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Fulfilment Outlet
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Current Assigned Outlet:{" "}
              <strong>{order.outlet?.name ? `${order.outlet.name} (${order.outlet.code})` : "Unassigned / Auto-match"}</strong>
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Select Bakery Outlet</InputLabel>
                <Select
                  value={selectedOutletId || order.outletId || ""}
                  label="Select Bakery Outlet"
                  onChange={(e) => setSelectedOutletId(e.target.value)}
                >
                  {outlets.map((outlet: any) => (
                    <MenuItem key={outlet.id} value={outlet.id}>
                      {outlet.name} ({outlet.city} — {outlet.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleReassignOutlet}
                disabled={!selectedOutletId || isAssigningOutlet || selectedOutletId === order.outletId}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                {isAssigningOutlet ? "Saving..." : "Update Assigned Outlet"}
              </Button>
            </Box>
          </Paper>

          {/* Customer & Address Details */}
          <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <PersonIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Customer & Delivery
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {user?.firstName ? `${user.firstName} ${user.lastName}` : "Customer"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Email: {user?.email || "N/A"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
              Phone: {user?.phone || deliveryAddress?.phone || "N/A"}
            </Typography>

            {deliveryAddress && (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                  <LocalShippingIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {deliveryAddress.label || "Delivery Address"}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  {deliveryAddress.line1}
                  {deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ""}
                  <br />
                  {deliveryAddress.city}, {deliveryAddress.state} — {deliveryAddress.postcode}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Payment Method & Status */}
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <PaymentIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Payment Method
              </Typography>
            </Box>

            <Chip
              label={isCod ? "💵 Cash on Delivery (COD)" : "💳 Online Payment (Razorpay)"}
              sx={{
                bgcolor: isCod ? "#FEF3C7" : "#DBEAFE",
                color: isCod ? "#92400E" : "#1E40AF",
                fontWeight: 800,
                mb: 1.5,
              }}
            />

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Payment Status: <strong>{order.paymentStatus || "PENDING"}</strong>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Toast Notification */}
      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ borderRadius: 2 }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
