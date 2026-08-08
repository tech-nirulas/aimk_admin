"use client";

import TableComponent from "@/components/common/DataTable";
import CustomerDetailModal from "@/components/ui/Customer/CustomerDetailModal";
import { useGetCustomersQuery } from "@/features/customers/customerApiService";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
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
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import { useMemo, useState } from "react";
import { FaEye, FaSearch } from "react-icons/fa";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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

  const { data, isLoading, refetch: handleRefresh } = useGetCustomersQuery({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
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
        field: "customer",
        headerName: "Customer",
        flex: 1.8,
        renderCell: ({ row }: any) => {
          const u = row.user || {};
          const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Customer";
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
              <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700, width: 36, height: 36 }}>
                {name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                  {name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {u.email || "No Email"}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        field: "phone",
        headerName: "Phone",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ color: "#334155" }}>
            {row.user?.phone || "N/A"}
          </Typography>
        ),
      },
      {
        field: "totalOrders",
        headerName: "Orders",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Chip
            label={`${row.totalOrders || 0} orders`}
            size="small"
            sx={{ fontWeight: 700, bgcolor: "#F1F5F9", color: "#334155" }}
          />
        ),
      },
      {
        field: "totalSpent",
        headerName: "Lifetime Spend",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: "success.main" }}>
            ₹{Number(row.totalSpent || 0).toLocaleString("en-IN")}
          </Typography>
        ),
      },
      {
        field: "loyaltyPoints",
        headerName: "Loyalty Points",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <EmojiEventsIcon sx={{ color: "#D97706", fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#D97706" }}>
              {row.loyaltyPoints || 0} pts
            </Typography>
          </Box>
        ),
      },
      {
        field: "lastOrderDate",
        headerName: "Last Order",
        flex: 1.2,
        renderCell: ({ row }: any) => (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleDateString() : "Never"}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.8,
        renderCell: ({ row }: any) => (
          <Box className="flex gap-3 items-center justify-start h-full">
            <Button
              size="small"
              variant="outlined"
              startIcon={<FaEye size={14} />}
              onClick={() => setSelectedCustomerId(row.id)}
              sx={{ borderRadius: 2, fontSize: "0.75rem" }}
            >
              Profile
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <Box className="p-6">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PeopleIcon sx={{ color: "primary.main", fontSize: "2rem" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Customer Directory & Loyalty
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Manage registered customers, view purchase histories, and adjust loyalty points
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
              placeholder="Search by name, email, or phone..."
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
              <MenuItem value="createdAt">Registered Date</MenuItem>
              <MenuItem value="loyaltyPoints">Loyalty Points</MenuItem>
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

      {selectedCustomerId && (
        <CustomerDetailModal
          open={Boolean(selectedCustomerId)}
          onClose={() => setSelectedCustomerId(null)}
          customerId={selectedCustomerId}
        />
      )}
    </Box>
  );
}
