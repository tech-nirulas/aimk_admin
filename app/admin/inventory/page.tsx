"use client";

import TableComponent from "@/components/common/DataTable";
import BatchForm from "@/components/ui/Inventory/BatchForm";
import {
  useDeleteBatchMutation,
  useGetBatchesQuery,
} from "@/features/inventory/inventoryApiService";
import { useToast } from "@/hooks/useToast";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
  Select,
  TextField,
  Tooltip,
  Typography,
  debounce,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";

export default function InventoryPage() {
  const { openDrawer } = useFormDrawer();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
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

  const { data, isLoading, refetch: handleRefresh } = useGetBatchesQuery({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
  });

  const [deleteBatch] = useDeleteBatchMutation();

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
    }
  };

  const handleCreateNew = useCallback(() => {
    openDrawer({
      drawerName: "Add Stock Batch",
      children: <BatchForm refetch={handleRefresh} />,
      width: 550,
      anchor: "right",
    });
  }, [openDrawer, handleRefresh]);

  const handleEdit = useCallback(
    (row: any) => {
      openDrawer({
        drawerName: "Edit Stock Batch",
        children: <BatchForm initialData={row} refetch={handleRefresh} />,
        width: 550,
        anchor: "right",
      });
    },
    [openDrawer, handleRefresh]
  );

  const handleDelete = async (id: string, batchNumber: string) => {
    if (confirm(`Are you sure you want to delete batch ${batchNumber}?`)) {
      try {
        await deleteBatch(id).unwrap();
        showSuccess("Batch deleted successfully");
        handleRefresh();
      } catch (err: any) {
        showError(err?.data?.message || "Failed to delete batch");
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "batchNumber",
        headerName: "Batch Number",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>
            {row.batchNumber}
          </Typography>
        ),
      },
      {
        field: "product",
        headerName: "Product",
        flex: 1.8,
        renderCell: ({ row }: any) => {
          const imgKey = row.product?.mainImage?.key;
          const imgUrl = imgKey
            ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/media/${imgKey}`
            : undefined;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
              <Avatar
                src={imgUrl}
                variant="rounded"
                sx={{ width: 36, height: 36, bgcolor: "#F1F5F9" }}
              />
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
        field: "outlet",
        headerName: "Outlet Location",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155" }}>
            {row.outlet?.name || "N/A"}
          </Typography>
        ),
      },
      {
        field: "quantity",
        headerName: "Stock Qty",
        flex: 1,
        renderCell: ({ row }: any) => {
          const isLow = row.quantity <= 5;
          return (
            <Chip
              label={`${row.quantity} units`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: isLow ? "#FEE2E2" : "#E0F2FE",
                color: isLow ? "#991B1B" : "#0369A1",
              }}
            />
          );
        },
      },
      {
        field: "expiresAt",
        headerName: "Expiry Date",
        flex: 1.5,
        renderCell: ({ row }: any) => {
          if (!row.expiresAt) return "N/A";
          const expDate = new Date(row.expiresAt);
          const now = new Date();
          const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

          let badgeColor = "#15803D";
          let badgeBg = "#DCFCE7";
          let label = expDate.toLocaleDateString();

          if (diffDays <= 0) {
            badgeColor = "#991B1B";
            badgeBg = "#FEE2E2";
            label = `${expDate.toLocaleDateString()} (EXPIRED)`;
          } else if (diffDays <= 3) {
            badgeColor = "#B45309";
            badgeBg = "#FEF3C7";
            label = `${expDate.toLocaleDateString()} (${diffDays}d left)`;
          }

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {diffDays <= 3 && (
                <Tooltip title="Expiring soon or expired">
                  <WarningAmberIcon sx={{ color: badgeColor, fontSize: 18 }} />
                </Tooltip>
              )}
              <Chip
                label={label}
                size="small"
                sx={{ fontWeight: 700, bgcolor: badgeBg, color: badgeColor }}
              />
            </Box>
          );
        },
      },
      {
        field: "storageLocation",
        headerName: "Storage Location",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {row.storageLocation || "—"}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: ({ row }: any) => {
          const statusMap: Record<string, { label: string; color: string; bg: string }> = {
            in_stock: { label: "In Stock", color: "#0369A1", bg: "#E0F2FE" },
            selling: { label: "Selling", color: "#15803D", bg: "#DCFCE7" },
            expired: { label: "Expired", color: "#991B1B", bg: "#FEE2E2" },
            used: { label: "Used", color: "#475569", bg: "#F1F5F9" },
          };

          const config = statusMap[row.status] || {
            label: row.status,
            color: "#475569",
            bg: "#F1F5F9",
          };

          return (
            <Chip
              label={config.label}
              size="small"
              sx={{ fontWeight: 700, bgcolor: config.bg, color: config.color }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Box className="flex gap-3 items-center justify-start h-full">
            <FaEdit
              className="cursor-pointer text-blue-600 hover:text-blue-800"
              size={16}
              onClick={() => handleEdit(row)}
            />
            <FaTrash
              className="cursor-pointer text-red-600 hover:text-red-800"
              size={16}
              onClick={() => handleDelete(row.id, row.batchNumber)}
            />
          </Box>
        ),
      },
    ],
    [handleEdit]
  );

  return (
    <Box className="p-6">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <InventoryIcon sx={{ color: "primary.main", fontSize: "2rem" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Inventory & Batches
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Track product stock batches, manufactured dates, expiry warnings, and outlet storage
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
            Add Batch
          </Button>
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
              placeholder="Search by batch number or SKU..."
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
              <MenuItem value="in_stock">In Stock</MenuItem>
              <MenuItem value="selling">Selling</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="used">Used</MenuItem>
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
              <MenuItem value="batchNumber">Batch No</MenuItem>
              <MenuItem value="quantity">Stock Qty</MenuItem>
              <MenuItem value="expiresAt">Expiry Date</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
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
