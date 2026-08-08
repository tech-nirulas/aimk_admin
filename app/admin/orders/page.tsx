"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import TableComponent from "@/components/common/DataTable";
import {
  useGetAllAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/features/order/orderApiService";

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateStatus({ id: orderId, status: newStatus });
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
          <Typography variant="body2" sx={{ fontWeight: 800, color: "#1E293B" }}>
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
          <Typography variant="caption" sx={{ fontWeight: 700, color: row.outlet ? "#0F172A" : "text.secondary" }}>
            {row.outlet?.name ? `🏪 ${row.outlet.name}` : "⚠️ Unassigned"}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Select
            size="small"
            value={row.status}
            onChange={(e) =>
              handleStatusChange(row.id, e.target.value)
            }
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="payment_failed">Failed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        ),
      },
      {
        field: "grandTotal",
        headerName: "Amount",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            ₹{Number(row.grandTotal).toFixed(2)}
          </Typography>
        ),
      },
      {
        field: "paymentStatus",
        headerName: "Payment",
        flex: 1,
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 1,
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
        <Typography variant="h2">Orders</Typography>
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
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="payment_failed">Failed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
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
    </Box>
  );
}