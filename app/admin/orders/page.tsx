"use client";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";

import TableComponent from "@/components/common/DataTable";
import {
  useGetAllAdminOrdersQuery,
  useUpdateOrderStatusMutation
} from "@/features/order/orderApiService";

export default function OrdersPage() {
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
      },
      {
        field: "paymentStatus",
        headerName: "Payment",
        flex: 1,
      },
      {
        field: "createdAt",
        headerName: "Created",
        flex: 1,
        renderCell: ({ row }: any) =>
          new Date(row.createdAt).toLocaleString(),
      },
    ],
    []
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