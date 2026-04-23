"use client";

import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import TableComponent from "@/components/common/DataTable";
import { useGetPaymentsQuery } from "@/features/payments/paymentApiService";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useGetPaymentsQuery({
    page,
    limit,
  });

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "razorpayOrderId",
        headerName: "RZP Order",
        flex: 1,
      },
      {
        field: "razorpayPaymentId",
        headerName: "Payment ID",
        flex: 1,
        renderCell: ({ row }: any) =>
          row.razorpayPaymentId || "-",
      },
      {
        field: "amount",
        headerName: "Amount",
        flex: 1,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
      },
      {
        field: "method",
        headerName: "Method",
        flex: 1,
        renderCell: ({ row }: any) =>
          row.method || "-",
      },
      {
        field: "placedAt",
        headerName: "Placed At",
        flex: 1,
        renderCell: ({ row }: any) =>
          new Date(row.placedAt).toLocaleString(),
      },
    ],
    []
  );

  return (
    <Box className="p-4">
      <Typography variant="h2" className="mb-4">
        Payments
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
          onPageChange={handlePageChange}
        />
      </Paper>
    </Box>
  );
}