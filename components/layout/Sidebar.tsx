"use client";

import LegalEntityIcon from "@mui/icons-material/AccountBox";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ImageIcon from "@mui/icons-material/Image";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocationIcon from "@mui/icons-material/LocationCity";
import MoneyIcon from "@mui/icons-material/Money";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CakeIcon from "@mui/icons-material/Cake";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PeopleIcon from "@mui/icons-material/People";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

const drawerWidth = 240;

const MENU_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
  { label: "Products", path: "/admin/products", icon: <InventoryIcon /> },
  { label: "Inventory & Batches", path: "/admin/inventory", icon: <InventoryIcon /> },
  { label: "Customers", path: "/admin/customers", icon: <PeopleIcon /> },
  { label: "Categories", path: "/admin/categories", icon: <CategoryIcon /> },
  { label: "Cake Customizations", path: "/admin/cake-customizations", icon: <CakeIcon /> },
  { label: "Customer Reviews", path: "/admin/reviews", icon: <RateReviewIcon /> },
  { label: "Team Users & Roles", path: "/admin/users", icon: <PeopleIcon /> },
  { label: "Media", path: "/admin/media", icon: <ImageIcon /> },
  { label: "Outlets", path: "/admin/outlets", icon: <LocationIcon /> },
  { label: "Brands", path: "/admin/brands", icon: <CategoryIcon /> },
  { label: "Legal Entities", path: "/admin/legal-entities", icon: <LegalEntityIcon /> },
  { label: "Outlet Prices", path: "/admin/outlet-prices", icon: <MoneyIcon /> },
  { label: "Orders", path: "/admin/orders", icon: <ShoppingCartOutlinedIcon /> },
  { label: "Payments", path: "/admin/payments", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Discounts", path: "/admin/discounts", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Offers", path: "/admin/offers", icon: <ReceiptLongOutlinedIcon /> },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        {/* Header */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h5">
            AIMK Admin
          </Typography>
        </Box>
        <Divider />
        <List>
          {MENU_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              {item.icon}
              <ListItemText sx={{ ml: 2 }} primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}