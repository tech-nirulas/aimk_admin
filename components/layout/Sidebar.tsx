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
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getVisibleSidebarModules } from "@aimk/permissions";

const drawerWidth = 240;

const ICON_MAP: Record<string, React.ReactNode> = {
  Dashboard: <DashboardIcon />,
  ShoppingBag: <InventoryIcon />,
  Inventory: <InventoryIcon />,
  People: <PeopleIcon />,
  Category: <CategoryIcon />,
  Cake: <CakeIcon />,
  RateReview: <RateReviewIcon />,
  Image: <ImageIcon />,
  Storefront: <LocationIcon />,
  AccountBox: <LegalEntityIcon />,
  PriceChange: <MoneyIcon />,
  ShoppingCart: <ShoppingCartOutlinedIcon />,
  Payments: <ReceiptLongOutlinedIcon />,
  LocalOffer: <ReceiptLongOutlinedIcon />,
  Discount: <ReceiptLongOutlinedIcon />,
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const permissions = useSelector((state: any) => state.authReducer?.permissions) || [];
  const user = useSelector((state: any) => state.authReducer?.user);

  const visibleModules = useMemo(() => {
    const allModules = getVisibleSidebarModules(permissions);

    // Super Admin sees all modules without restriction
    if (user?.role?.name === 'super_admin' || permissions.includes('*') || permissions.includes('*:*')) {
      return allModules;
    }

    // If the user has roleModules from the backend, use them to filter sidebar visibility
    const roleModules = user?.role?.roleModules;
    if (roleModules && Array.isArray(roleModules) && roleModules.length > 0) {
      const allowedPaths = new Set(
        roleModules
          .filter((rm: any) => rm.canView || rm.canAccess)
          .map((rm: any) => rm.module?.path)
          .filter(Boolean)
      );
      if (allowedPaths.size > 0) {
        return allModules.filter((m) => allowedPaths.has(m.path));
      }
    }

    return allModules;
  }, [permissions, user]);

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
          {visibleModules.map((item) => (
            <ListItemButton
              key={item.path}
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              {ICON_MAP[item.icon] || <DashboardIcon />}
              <ListItemText sx={{ ml: 2 }} primary={item.name} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}