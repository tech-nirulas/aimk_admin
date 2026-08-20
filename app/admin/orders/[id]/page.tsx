"use client";

import {
  useAssignOrderOutletMutation,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/features/order/orderApiService";
import { useGetAllOutletsQuery } from "@/features/outlets/outletsApiService";
import { useMarkCodCollectedMutation } from "@/features/payments/paymentApiService";
import OrderStatusSelect from "@/components/common/OrderStatusSelect";
import { getOrderStatusConfig } from "@/utils/orderStatus";
import { getPaymentStatusConfig, isCollectable } from "@/utils/paymentStatus";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { data: rawOrderData, isLoading, error } = useGetAdminOrderQuery({ id: orderId });
  const { data: outletsData } = useGetAllOutletsQuery({ page: 1, limit: 100 });
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [assignOutlet, { isLoading: isAssigningOutlet }] = useAssignOrderOutletMutation();
  const [markCodCollected, { isLoading: isCollectingCash }] = useMarkCodCollectedMutation();

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
      setSnackMsg(`Order status updated to ${getOrderStatusConfig(newStatus).label}`);
      setSnackOpen(true);
    } catch {
      setSnackMsg("Failed to update order status");
      setSnackOpen(true);
    }
  };

  const handleMarkCashReceived = async () => {
    try {
      await markCodCollected({ orderId }).unwrap();
      setSnackMsg("Cash payment recorded for this order");
      setSnackOpen(true);
    } catch (err: any) {
      setSnackMsg(
        err?.data?.message || "Failed to record the cash payment. Please try again.",
      );
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
  const statusStyle = getOrderStatusConfig(statusStr);
  const user = order.customer?.user;
  const deliveryAddress = order.deliveryAddress;
  const isCod = order.paymentMethod === "COD" || (Array.isArray(order.payments) && order.payments[0]?.method?.toLowerCase() === "cod");
  const payments: any[] = Array.isArray(order.payments) ? order.payments : [];
  // The order carries a rolled-up paymentStatus; the payment rows carry the
  // gateway detail. Prefer the row when there is one.
  const primaryPayment = payments[0];
  const paymentStatusValue = primaryPayment?.status || order.paymentStatus || "PENDING";
  const paymentStatusStyle = getPaymentStatusConfig(paymentStatusValue);
  const canCollectCash = isCod && isCollectable(paymentStatusValue);

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
            label={statusStyle.label}
            sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 800, px: 1 }}
          />

          <OrderStatusSelect
            value={statusStr}
            onChange={handleStatusChange}
            disabled={isUpdatingStatus}
            label="Update Status"
            minWidth={170}
          />
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
                  <TableRow>
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
              <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid #E2E8F0" }}>
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

          {/* Payment Method, Status & Transaction Details */}
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PaymentIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Payment
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip
                label={isCod ? "💵 Cash on Delivery" : "💳 Online (Razorpay)"}
                size="small"
                sx={{
                  bgcolor: isCod ? "#FEF3C7" : "#DBEAFE",
                  color: isCod ? "#92400E" : "#1E40AF",
                  fontWeight: 800,
                }}
              />
              <Chip
                label={paymentStatusStyle.label}
                size="small"
                sx={{
                  bgcolor: paymentStatusStyle.bg,
                  color: paymentStatusStyle.color,
                  fontWeight: 800,
                }}
              />
            </Box>

            {/* COD collection — the only way a cash order's payment ever
                reaches CAPTURED, since no gateway callback exists for it. */}
            {isCod && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: canCollectCash ? "#FFFBEB" : "#F0FDF4",
                  border: `1px solid ${canCollectCash ? "#FDE68A" : "#BBF7D0"}`,
                }}
              >
                {canCollectCash ? (
                  <>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "#92400E", fontWeight: 700, mb: 1 }}
                    >
                      Cash of ₹{Number(order.grandTotal).toFixed(2)} has not been recorded as
                      received yet.
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<PaymentsIcon />}
                      onClick={handleMarkCashReceived}
                      disabled={isCollectingCash}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                    >
                      {isCollectingCash ? "Recording..." : "Mark Cash Received"}
                    </Button>
                  </>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: "#16A34A" }} />
                    <Typography variant="caption" sx={{ color: "#166534", fontWeight: 700 }}>
                      {paymentStatusStyle.value === "CAPTURED"
                        ? `Cash received${
                            primaryPayment?.capturedAt
                              ? ` on ${new Date(primaryPayment.capturedAt).toLocaleString()}`
                              : ""
                          }`
                        : `Payment ${paymentStatusStyle.label.toLowerCase()}`}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Transaction records — so an admin can tie a gateway payment to
                this order without cross-referencing the Payments screen. */}
            {payments.length === 0 ? (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5, fontWeight: 700 }}>
                  {isCod ? "Cash on Delivery Order" : "Online Gateway Payment (Razorpay)"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  {isCod
                    ? "Payment will be captured once cash is collected."
                    : "No captured transaction callback received yet for this order."}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {payments.map((p: any) => {
                  const style = getPaymentStatusConfig(p.status);
                  return (
                    <Box
                      key={p.id}
                      sx={{ p: 1.5, borderRadius: 2, border: "1px solid #E2E8F0", bgcolor: "#FAFAFA" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <ReceiptLongIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>
                            ₹{Number(p.amount).toFixed(2)} {p.currency || "INR"}
                          </Typography>
                        </Box>
                        <Chip
                          label={style.label}
                          size="small"
                          sx={{
                            bgcolor: style.bg,
                            color: style.color,
                            fontWeight: 800,
                            height: 20,
                            fontSize: "0.6rem",
                          }}
                        />
                      </Box>

                      <PaymentFact label="Payment ID" value={p.razorpayPaymentId} mono copyable onCopy={setSnackMsg} onOpenSnack={() => setSnackOpen(true)} />
                      <PaymentFact label="Gateway Order ID" value={p.razorpayOrderId} mono copyable onCopy={setSnackMsg} onOpenSnack={() => setSnackOpen(true)} />
                      <PaymentFact
                        label="Method"
                        value={
                          p.method
                            ? [p.method.toUpperCase(), p.bank, p.wallet, p.vpa].filter(Boolean).join(" · ")
                            : null
                        }
                      />
                      <PaymentFact
                        label="Captured"
                        value={p.capturedAt ? new Date(p.capturedAt).toLocaleString() : null}
                      />
                      <PaymentFact
                        label="Failed"
                        value={p.failedAt ? new Date(p.failedAt).toLocaleString() : null}
                      />
                      {p.errorDescription && (
                        <PaymentFact
                          label="Error"
                          value={`${p.errorCode ? `${p.errorCode}: ` : ""}${p.errorDescription}`}
                        />
                      )}
                      {p.refundId && (
                        <>
                          <PaymentFact label="Refund ID" value={p.refundId} mono copyable onCopy={setSnackMsg} onOpenSnack={() => setSnackOpen(true)} />
                          <PaymentFact
                            label="Refunded"
                            value={
                              p.refundedAt
                                ? `₹${Number(p.refundAmount ?? 0).toFixed(2)} on ${new Date(
                                    p.refundedAt,
                                  ).toLocaleString()}`
                                : `₹${Number(p.refundAmount ?? 0).toFixed(2)}`
                            }
                          />
                        </>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}

            <Button
              fullWidth
              size="small"
              variant="text"
              onClick={() => router.push("/admin/payments")}
              sx={{ mt: 1.5, textTransform: "none", fontWeight: 700 }}
            >
              Open Payments screen →
            </Button>
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

// ── PaymentFact helper ────────────────────────────────────────────────────────
function PaymentFact({
  label,
  value,
  mono,
  copyable,
  onCopy,
  onOpenSnack,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  copyable?: boolean;
  onCopy?: (msg: string) => void;
  onOpenSnack?: () => void;
}) {
  if (!value) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    if (onCopy && onOpenSnack) {
      onCopy(`Copied ${label}: ${value}`);
      onOpenSnack();
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, py: 0.35 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, maxWidth: "70%", justifyContent: "flex-end" }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textAlign: "right",
            wordBreak: "break-all",
            ...(mono ? { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } : {}),
          }}
        >
          {value}
        </Typography>
        {copyable && (
          <Tooltip title={`Copy ${label}`}>
            <ContentCopyIcon
              onClick={handleCopy}
              sx={{
                fontSize: "0.75rem",
                color: "text.disabled",
                cursor: "pointer",
                flexShrink: 0,
                "&:hover": { color: "primary.main" },
              }}
            />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
