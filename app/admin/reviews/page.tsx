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
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Rating,
  Select,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { FaSearch, FaTrash } from "react-icons/fa";

export default function ReviewsPage() {
  const { openDialog } = useConfirmDialog();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
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
    if (field === "limit") setLimit(value);
    if (field === "sortBy") setSortBy(value);
    if (field === "sortOrder") setSortOrder(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(10);
    setPage(1);
    debouncedSearch("");
  };

  const { data, isLoading, refetch: handleRefresh } = useGetAdminReviewsQuery({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  const [deleteReview] = useDeleteReviewMutation();

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
    }
  };

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

      {/* Filters Section */}
      <Paper className="mb-4 p-4" sx={{ borderRadius: 3 }}>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              onChange={handleSearchChange}
              placeholder="Search by product, customer, or comment..."
              slotProps={{
                input: {
                  startAdornment: <FaSearch className="mr-2 text-gray-400" />,
                },
              }}
            />
          </div>

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
              <MenuItem value="rating">Rating</MenuItem>
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
      <Paper sx={{ p: 3, borderRadius: 3 }}>
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
    </Box>
  );
}
