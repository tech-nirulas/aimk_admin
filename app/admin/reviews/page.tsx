"use client";

import TableComponent from "@/components/common/DataTable";
import {
  useDeleteReviewMutation,
  useGetAdminReviewsQuery,
} from "@/features/reviews/reviewApiService";
import { useConfirmDialog } from "@/lib/DialogProvider";
import RateReviewIcon from "@mui/icons-material/RateReview";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Rating,
  Typography,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { FaTrash } from "react-icons/fa";

export default function ReviewsPage() {
  const { openDialog } = useConfirmDialog();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, refetch: handleRefresh } = useGetAdminReviewsQuery({ page, limit });
  const [deleteReview] = useDeleteReviewMutation();

  const handleDelete = useCallback(
    (row: any) => {
      openDialog("Are you sure you want to delete this customer review?", async () => {
        await deleteReview({ id: row.id });
      });
    },
    [deleteReview, openDialog]
  );

  const columns = useMemo(
    () => [
      {
        field: "product",
        headerName: "Product",
        flex: 1.5,
        renderCell: ({ row }: any) => {
          const imgUrl = row.product?.mainImage?.key
            ? `${process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:9090'}/media/${row.product.mainImage.key}`
            : null;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
              <Avatar
                src={imgUrl || undefined}
                variant="rounded"
                sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: "#F1F5F9" }}
              >
                🥐
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                  {row.product?.name || "Product"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  SKU: {row.product?.sku || "N/A"}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        field: "customer",
        headerName: "Customer",
        flex: 1.2,
        renderCell: ({ row }: any) => {
          const user = row.customer?.user;
          const name = user ? `${user.firstName} ${user.lastName}`.trim() : "Guest";
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                {name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                {user?.email || user?.phone || "N/A"}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "rating",
        headerName: "Rating",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
            <Rating value={row.rating} readOnly size="small" precision={0.5} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#D97706" }}>
              ({row.rating})
            </Typography>
          </Box>
        ),
      },
      {
        field: "comment",
        headerName: "Review Comment",
        flex: 2,
        renderCell: ({ row }: any) => (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ color: "#334155", fontStyle: row.comment ? "normal" : "italic" }}>
              {row.comment || "No written comment"}
            </Typography>
          </Box>
        ),
      },
      {
        field: "isVerified",
        headerName: "Verified Purchase",
        flex: 1,
        renderCell: ({ row }: any) => (
          <Chip
            label={row.isVerified ? "✓ Verified Buyer" : "Unverified"}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: row.isVerified ? "#DCFCE7" : "#F1F5F9",
              color: row.isVerified ? "#15803D" : "#64748B",
            }}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.6,
        renderCell: ({ row }: any) => (
          <Box className="flex gap-3 items-center justify-start h-full">
            <FaTrash
              className="cursor-pointer text-red-600 hover:text-red-800"
              size={16}
              onClick={() => handleDelete(row)}
            />
          </Box>
        ),
      },
    ],
    [handleDelete]
  );

  return (
    <Box className="p-6">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <RateReviewIcon sx={{ color: "primary.main", fontSize: "2rem" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Customer Reviews & Ratings
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Moderate product feedback and customer ratings
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
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
    </Box>
  );
}
