"use client";

import TableComponent from "@/components/common/DataTable";
import CustomerDetailModal from "@/components/ui/Customer/CustomerDetailModal";
import { useGetCustomersQuery } from "@/features/customers/customerApiService";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { FaEye } from "react-icons/fa";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data, isLoading, refetch: handleRefresh } = useGetCustomersQuery({ page, limit, search });

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
          <TextField
            size="small"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 260 }}
          />
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
