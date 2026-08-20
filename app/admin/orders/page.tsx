"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import PaymentsIcon from "@mui/icons-material/Payments";
import { useRouter } from "next/navigation";
import TableComponent from "@/components/common/DataTable";
import RealtimeStatus from "@/components/common/RealtimeStatus";
import { REALTIME_ROOMS } from "@/features/realtime/realtimeEvents";
import OrderStatusSelect from "@/components/common/OrderStatusSelect";
import { ORDER_STATUSES, getOrderStatusConfig } from "@/utils/orderStatus";
import { getPaymentStatusConfig, isCollectable } from "@/utils/paymentStatus";
import {
  useGetAllAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/features/order/orderApiService";
import { useMarkCodCollectedMutation } from "@/features/payments/paymentApiService";

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("placedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    setSortBy("placedAt");
    setSortOrder("desc");
    setLimit(10);
    setPage(1);
    debouncedSearch("");
  };

  const { data, isLoading } = useGetAllAdminOrdersQuery({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
  });

  const [updateStatus] = useUpdateOrderStatusMutation();
  const [markCodCollected] = useMarkCodCollectedMutation();

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");

  const showSnack = (msg: string, severity: "success" | "error" = "success") => {
    setSnackMsg(msg);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
      showSnack(`Order status updated to ${getOrderStatusConfig(newStatus).label}`);
    } catch {
      showSnack("Failed to update order status", "error");
    }
  };

  const handleMarkCashReceived = async (orderId: string) => {
    try {
      await markCodCollected({ orderId }).unwrap();
      showSnack("Cash collection recorded successfully");
    } catch (err: any) {
      showSnack(
        err?.data?.message || "Failed to record cash payment. Please try again.",
        "error"
      );
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
        headerName: "Order ID",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {row.orderNumber}
          </Typography>
        ),
      },
      {
        field: "customer",
        headerName: "Customer",
        flex: 1,
        renderCell: ({ row }: any) => {
          const u = row.customer?.user || {};
          const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Customer";
          return (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {name}
            </Typography>
          );
        },
      },
      {
        field: "outlet",
        headerName: "Fulfilment Outlet",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {row.outlet?.name ? `🏪 ${row.outlet.name}` : "⚠️ Unassigned"}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1.1,
        renderCell: ({ row }: any) => (
          <OrderStatusSelect
            value={row.status}
            onChange={(next) => handleStatusChange(row.id, next)}
          />
        ),
      },
      {
        field: "grandTotal",
        headerName: "Amount",
        flex: 0.9,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            ₹{Number(row.grandTotal).toFixed(2)}
          </Typography>
        ),
      },
      {
        field: "paymentStatus",
        headerName: "Payment",
        flex: 1.3,
        renderCell: ({ row }: any) => {
          const isCod =
            row.paymentMethod === "COD" ||
            (Array.isArray(row.payments) && row.payments[0]?.method?.toLowerCase() === "cod");
          const payments: any[] = Array.isArray(row.payments) ? row.payments : [];
          const primaryPayment = payments[0];
          const payStatus = primaryPayment?.status || row.paymentStatus || "PENDING";
          const payConfig = getPaymentStatusConfig(payStatus);
          const canCollect = isCod && isCollectable(payStatus);

          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                <Chip
                  label={isCod ? "💵 COD" : "💳 Online"}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    bgcolor: isCod ? "#FEF3C7" : "#DBEAFE",
                    color: isCod ? "#92400E" : "#1E40AF",
                  }}
                />
                <Chip
                  label={payConfig.label}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    bgcolor: payConfig.bg,
                    color: payConfig.color,
                  }}
                />
              </Box>
              {canCollect && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<PaymentsIcon sx={{ fontSize: "0.8rem !important" }} />}
                  onClick={() => handleMarkCashReceived(row.id)}
                  sx={{
                    fontSize: "0.65rem",
                    py: 0.2,
                    px: 1,
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: 1.5,
                  }}
                >
                  Collect Cash
                </Button>
              )}
            </Box>
          );
        },
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 0.9,
        renderCell: ({ row }: any) => (
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`/admin/orders/${row.id}`)}
            sx={{ borderRadius: 2, textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
          >
            View Details
          </Button>
        ),
      },
    ],
    [router]
  );

  return (
    <Box className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Typography variant="h2">Orders</Typography>
          <RealtimeStatus room={REALTIME_ROOMS.ORDERS} />
        </div>
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
              placeholder="Search by order ID or customer name..."
              slotProps={{
                input: {
                  startAdornment: <FaSearch className="mr-2 text-gray-400" />,
                },
              }}
            />
          </div>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {ORDER_STATUSES.map((s) => (
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
              <MenuItem value="placedAt">Placed Date</MenuItem>
              <MenuItem value="grandTotal">Amount</MenuItem>
              <MenuItem value="status">Status</MenuItem>
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

      {/* Table */}
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

      {/* Toast Notification */}
      <Snackbar open={snackOpen} autoHideDuration={3500} onClose={() => setSnackOpen(false)}>
        <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)} sx={{ borderRadius: 2 }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}