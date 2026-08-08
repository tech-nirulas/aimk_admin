"use client";

import TableComponent from "@/components/common/DataTable";
import OfferForm from "@/components/ui/Offer/OfferForm";
import {
  useDeleteOfferMutation,
  useGetOffersQuery,
  useUpdateOfferMutation,
} from "@/features/offers/offerApiService";
import {
  clearSelectedOffer,
  setSelectedOffer,
} from "@/features/offers/offerSlice";
import { useConfirmDialog } from "@/lib/DialogProvider";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
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
  Select,
  Switch,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";

export default function OffersPage() {
  const dispatch = useDispatch();
  const { openDrawer, setIsEditing } = useFormDrawer();
  const { openDialog } = useConfirmDialog();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<string>("");
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
    if (field === "isActive") setIsActive(value);
    if (field === "limit") setLimit(value);
    if (field === "sortBy") setSortBy(value);
    if (field === "sortOrder") setSortOrder(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setIsActive("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(10);
    setPage(1);
    debouncedSearch("");
  };

  const { data, isLoading, refetch: handleRefresh } = useGetOffersQuery({
    page,
    limit,
    search: search || undefined,
    isActive: isActive ? isActive === "true" : undefined,
    sortBy,
    sortOrder,
  });

  const [updateOffer] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await updateOffer({ id, isActive: !currentStatus });
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
    }
  };

  const handleEdit = useCallback(
    (row: any) => {
      dispatch(setSelectedOffer(row));
      setIsEditing(true);

      openDrawer({
        drawerName: "Edit Offer Campaign",
        children: <OfferForm refetch={handleRefresh} />,
        dispatchFunctions: [clearSelectedOffer],
        isEditing: true,
        width: 550,
        anchor: "right",
      });
    },
    [dispatch, setIsEditing, openDrawer, handleRefresh]
  );

  const handleCreate = () => {
    dispatch(clearSelectedOffer());
    setIsEditing(false);

    openDrawer({
      drawerName: "Create Offer & Hero Banner",
      children: <OfferForm refetch={handleRefresh} />,
      dispatchFunctions: [clearSelectedOffer],
      width: 550,
      anchor: "right",
    });
  };

  const handleDelete = useCallback(
    (row: any) => {
      openDialog("Are you sure you want to delete this offer campaign?", async () => {
        await deleteOffer({ id: row.id });
      });
    },
    [deleteOffer, openDialog]
  );

  const columns = useMemo(
    () => [
      {
        field: "banner",
        headerName: "Hero Banner",
        flex: 0.8,
        renderCell: ({ row }: any) => {
          const firstBanner = row.banners?.[0];
          const imgUrl = firstBanner?.media?.url;
          return imgUrl ? (
            <Avatar
              src={imgUrl}
              variant="rounded"
              sx={{ width: 80, height: 45, borderRadius: 1.5, border: "1px solid #E2E8F0" }}
            />
          ) : (
            <Chip label="No Banner" size="small" variant="outlined" sx={{ fontSize: "0.65rem" }} />
          );
        },
      },
      {
        field: "title",
        headerName: "Offer Title & Code",
        flex: 1.5,
        renderCell: ({ row }: any) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
              {row.title}
            </Typography>
            {row.code && (
              <Chip
                label={`🎟️ ${row.code}`}
                size="small"
                sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800, bgcolor: "#FEF3C7", color: "#92400E", mt: 0.5 }}
              />
            )}
          </Box>
        ),
      },
      {
        field: "offerType",
        headerName: "Type",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Chip
            label={row.offerType}
            size="small"
            sx={{ fontWeight: 700, bgcolor: row.offerType === "PERCENTAGE" ? "#E0E7FF" : "#DBEAFE", color: "#1E40AF" }}
          />
        ),
      },
      {
        field: "value",
        headerName: "Value",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: "#059669" }}>
            {row.offerType === "PERCENTAGE" ? `${row.discountPct}%` : `₹${row.discountFlat}`}
          </Typography>
        ),
      },
      {
        field: "targetType",
        headerName: "Target Scope",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Chip label={row.targetType} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
        ),
      },
      {
        field: "isActive",
        headerName: "Active",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Switch
            checked={row.isActive}
            onChange={() => handleToggleActive(row.id, row.isActive)}
            color="primary"
            size="small"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.6,
        renderCell: ({ row }: any) => (
          <Box className="flex gap-3 items-center justify-start h-full">
            <FaEdit
              className="cursor-pointer text-blue-600 hover:text-blue-800"
              size={18}
              onClick={() => handleEdit(row)}
            />
            <FaTrash
              className="cursor-pointer text-red-600 hover:text-red-800"
              size={16}
              onClick={() => handleDelete(row)}
            />
          </Box>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  return (
    <Box className="p-6">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LocalOfferIcon sx={{ color: "primary.main", fontSize: "2rem" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Promotional Offers & Hero Banners
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Manage active campaign offers and homepage hero carousel banners
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            + Create Offer & Banner
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
              placeholder="Search by offer title or promo code..."
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
              value={isActive}
              label="Status"
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
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
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
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