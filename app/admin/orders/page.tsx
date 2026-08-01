"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import TableComponent from "@/components/common/DataTable";
import {
  useGetAllAdminOrdersQuery,
  useUpdateOrderStatusMutation
} from "@/features/order/orderApiService";

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useGetAllAdminOrdersQuery({
    page,
    limit,
  });

  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateStatus({ id: orderId, status: newStatus });
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

      {/* Filters */}
      <Paper className="mb-4 p-4">
        <div className="flex gap-4">
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
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
      />
    </Box>
  );
}