"use client";

import TableComponent from "@/components/common/DataTable";
import {
  useGetPaymentsQuery,
  useRefundPaymentMutation,
} from "@/features/payments/paymentApiService";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

const STATUS_CHIPS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#FEF3C7", color: "#D97706" },
  AUTHORIZED: { bg: "#DBEAFE", color: "#2563EB" },
  CAPTURED: { bg: "#D1FAE5", color: "#059669" },
  REFUNDED: { bg: "#FEE2E2", color: "#DC2626" },
  FAILED: { bg: "#FEE2E2", color: "#DC2626" },
};

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRefundRow, setSelectedRefundRow] = useState<any>(null);

  const { data, isLoading } = useGetPaymentsQuery({
    page,
    limit,
  });

  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation();

  const handleConfirmRefund = async () => {
    if (!selectedRefundRow) return;
    try {
      await refundPayment({ orderId: selectedRefundRow.orderId }).unwrap();
      setSelectedRefundRow(null);
    } catch (err) {
      console.error("Refund failed:", err);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "orderNumber",
        headerName: "Order No",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: "#1E293B" }}>
            {row.order?.orderNumber || "N/A"}
          </Typography>
        ),
      },
      {
        field: "customer",
        headerName: "Customer",
        flex: 1.2,
        renderCell: ({ row }: any) => {
          const user = row.order?.customer?.user;
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.name || "Customer"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.phone || user?.email || "N/A"}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "amount",
        headerName: "Amount",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
            ₹{Number(row.amount).toFixed(2)}
          </Typography>
        ),
      },
      {
        field: "method",
        headerName: "Method",
        flex: 1,
        renderCell: ({ row }: any) => {
          const isCod = row.method?.toLowerCase() === "cod" || row.order?.paymentMethod === "COD";
          return (
            <Chip
              label={isCod ? "💵 COD" : row.method ? `💳 ${row.method}` : "💳 Razorpay"}
              size="small"
              sx={{
                bgcolor: isCod ? "#FEF3C7" : "#F1F5F9",
                color: isCod ? "#92400E" : "#334155",
                fontWeight: 700,
              }}
            />
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: ({ row }: any) => {
          const chipStyle = STATUS_CHIPS[row.status] || { bg: "#F1F5F9", color: "#334155" };
          return (
            <Chip
              label={row.status}
              size="small"
              sx={{
                bgcolor: chipStyle.bg,
                color: chipStyle.color,
                fontWeight: 800,
              }}
            />
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Date",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 0.8,
        renderCell: ({ row }: any) => {
          const isRefunded = row.status === "REFUNDED";
          return (
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={isRefunded}
              startIcon={<UndoIcon fontSize="small" />}
              onClick={() => setSelectedRefundRow(row)}
              sx={{ borderRadius: 2, textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
            >
              {isRefunded ? "Refunded" : "Refund"}
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <Box className="p-4">
      <Typography variant="h2" className="mb-4">
        Payment & Refund Management
      </Typography>

      <Paper className="p-4">
        <TableComponent
          columns={columns}
          data={data?.data || []}
          currentPage={page}
          setCurrentPage={setPage}
          pageSize={limit}
          totalItems={data?.meta?.totalItems || 0}
          isLoading={isLoading}
        />
      </Paper>

      {/* Confirmation Dialog for Refund */}
      <Dialog open={Boolean(selectedRefundRow)} onClose={() => setSelectedRefundRow(null)} maxWidth="xs" fullWidth>
        {selectedRefundRow && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>Confirm Refund</DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Are you sure you want to refund <strong>₹{Number(selectedRefundRow.amount).toFixed(2)}</strong> for Order <strong>#{selectedRefundRow.order?.orderNumber}</strong>?
              </Typography>

              {selectedRefundRow.order?.paymentMethod === "COD" ? (
                <Typography variant="caption" sx={{ color: "warning.main", display: "block", fontWeight: 700 }}>
                  Note: This is a Cash on Delivery order. Processing this refund will record the cash return in the system and mark the order as refunded.
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: "info.main", display: "block", fontWeight: 700 }}>
                  Note: This will execute an automatic refund request via Razorpay API back to the customer's account.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedRefundRow(null)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleConfirmRefund} disabled={isRefunding}>
                {isRefunding ? "Processing..." : "Confirm Refund"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}