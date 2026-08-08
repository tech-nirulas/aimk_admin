"use client";

import { useGetDashboardMetricsQuery } from "@/features/analytics/analyticsApiService";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingBagIcon from "@mui/icons-material/ShoppingCartOutlined";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";

export default function AdminDashboard() {
  const { data, isLoading, refetch } = useGetDashboardMetricsQuery({});

  const actualData = (data as any)?.data || data;
  const metrics = actualData?.overview || {};
  const topProducts = actualData?.topProducts || [];

  return (
    <Box className="p-6">
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0F172A" }}>
            Executive Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Welcome back! Real-time sales performance, store activity, and product insights.
          </Typography>
        </Box>
        <IconButton onClick={() => refetch()} title="Refresh metrics">
          <RefreshIcon />
        </IconButton>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Stat 1: Total Revenue */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                color: "#FFFFFF",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, letterSpacing: 1 }}>
                  TOTAL REVENUE
                </Typography>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.1)", width: 36, height: 36 }}>
                  <AttachMoneyIcon sx={{ color: "#38BDF8" }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mt: 1.5, mb: 1 }}>
                ₹{Number(metrics.totalRevenue || 0).toLocaleString("en-IN")}
              </Typography>
              <Typography variant="caption" sx={{ color: "#38BDF8", fontWeight: 700 }}>
                Today: ₹{Number(metrics.todayRevenue || 0).toLocaleString("en-IN")} • Month: ₹
                {Number(metrics.monthlyRevenue || 0).toLocaleString("en-IN")}
              </Typography>
            </Paper>
          </Grid>

          {/* Stat 2: Total Orders */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                  TOTAL ORDERS
                </Typography>
                <Avatar sx={{ bgcolor: "#F0F9FF", width: 36, height: 36 }}>
                  <ShoppingBagIcon sx={{ color: "#0284C7" }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mt: 1.5, mb: 1 }}>
                {metrics.totalOrders || 0}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip label={`${metrics.pendingOrders || 0} Pending`} size="small" sx={{ bgcolor: "#FEF3C7", color: "#B45309", fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
                <Chip label={`${metrics.deliveredOrders || 0} Delivered`} size="small" sx={{ bgcolor: "#DCFCE7", color: "#15803D", fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
              </Box>
            </Paper>
          </Grid>

          {/* Stat 3: Registered Customers */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                  ACTIVE CUSTOMERS
                </Typography>
                <Avatar sx={{ bgcolor: "#FDF4FF", width: 36, height: 36 }}>
                  <PeopleIcon sx={{ color: "#C026D3" }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mt: 1.5, mb: 1 }}>
                {metrics.activeCustomers || 0}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Registered customer directory
              </Typography>
            </Paper>
          </Grid>

          {/* Stat 4: Active Outlets */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                  BAKERY OUTLETS
                </Typography>
                <Avatar sx={{ bgcolor: "#ECFDF5", width: 36, height: 36 }}>
                  <LocationOnIcon sx={{ color: "#059669" }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mt: 1.5, mb: 1 }}>
                {metrics.activeOutlets || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700 }}>
                Fulfilling local delivery & pickup
              </Typography>
            </Paper>
          </Grid>

          {/* Quick Shortcuts */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                QUICK ACTIONS & SHORTCUTS
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button component={Link} href="/admin/products" variant="contained" startIcon={<AddIcon />}>
                  Add Product
                </Button>
                <Button component={Link} href="/admin/orders" variant="outlined" startIcon={<ShoppingBagIcon />}>
                  Manage Orders
                </Button>
                <Button component={Link} href="/admin/customers" variant="outlined" startIcon={<PeopleIcon />}>
                  Customer Directory
                </Button>
                <Button component={Link} href="/admin/inventory" variant="outlined" startIcon={<LocalShippingIcon />}>
                  Stock Batches
                </Button>
                <Button component={Link} href="/admin/offers" variant="outlined" startIcon={<StarIcon />}>
                  Promotions & Banners
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Top Selling Products Table */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Top Selling Products
                  </Typography>
                </Box>
                <Button component={Link} href="/admin/products" size="small">
                  View All Products
                </Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>SKU</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Units Sold</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>Revenue Earned</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.length > 0 ? (
                    topProducts.map((item: any, idx: number) => {
                      const imgKey = item.product?.mainImage?.key;
                      const imgUrl = imgKey
                        ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/media/${imgKey}`
                        : undefined;
                      return (
                        <TableRow key={item.product?.id || idx} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar src={imgUrl} variant="rounded" sx={{ width: 36, height: 36, bgcolor: "#F1F5F9" }} />
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {item.product?.name || "Product"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {item.product?.sku || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={`${item.quantitySold} units`} size="small" color="primary" sx={{ fontWeight: 800 }} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "success.main" }}>
                              ₹{Number(item.totalRevenue || 0).toLocaleString("en-IN")}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No product sales recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}