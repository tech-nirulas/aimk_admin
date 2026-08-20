"use client";

import TableComponent from "@/components/common/DataTable";
import RealtimeStatus from "@/components/common/RealtimeStatus";
import { REALTIME_ROOMS } from "@/features/realtime/realtimeEvents";
import { PAYMENT_STATUSES, getPaymentStatusConfig } from "@/utils/paymentStatus";
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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRefundRow, setSelectedRefundRow] = useState<any>(null);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1);
      }, 500),
    [setSearch, setPage]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (field: string, value: any) => {
    if (field === "status") setStatus(value);
    if (field === "limit") setLimit(value);
    if (field === "sortBy") setSortBy(value);
    if (field === "sortOrder") setSortOrder(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(10);
    setPage(1);
    debouncedSearch("");
  };

  const { data, isLoading } = useGetPaymentsQuery({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
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

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "orderNumber",
        headerName: "Order No",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
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
                {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Customer"}
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
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
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
          const chipStyle = getPaymentStatusConfig(row.status);
          return (
            <Chip
              label={chipStyle.label}
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
      <div className="flex items-center gap-3 mb-4">
        <Typography variant="h2">Payment &amp; Refund Management</Typography>
        <RealtimeStatus room={REALTIME_ROOMS.PAYMENTS} />
      </div>

      {/* Filters Section */}
      <Paper className="mb-4 p-4">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              onChange={handleSearchChange}
              placeholder="Search by Order ID or Payment ID..."
              slotProps={{
                input: {
                  startAdornment: <FaSearch className="mr-2 text-gray-400" />,
                },
              }}
            />
          </div>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {PAYMENT_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Items per page</InputLabel>
            <Select
              value={limit}
              label="Items per page"
              onChange={(e) => handleFilterChange("limit", e.target.value)}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <MenuItem value="createdAt">Date</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </Paper>

      {/* Data Table */}
      <Paper className="p-4">
        <TableComponent
          columns={columns}
          data={data?.data || []}
          currentPage={page}
          setCurrentPage={setPage}
          pageSize={limit}
          totalItems={data?.meta?.totalItems || 0}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      </Paper>

      {/* Pagination Info */}
      {data?.meta && data.meta.totalItems > 0 && (
        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
          <div>
            Showing {(data.meta.page - 1) * data.meta.limit + 1} to{" "}
            {Math.min(data.meta.page * data.meta.limit, data.meta.totalItems)} of{" "}
            {data.meta.totalItems} entries
          </div>
          <div>
            Page {data.meta.page} of {data.meta.totalPages}
          </div>
        </div>
      )}

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