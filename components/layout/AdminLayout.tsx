"use client";

import { Box, useTheme } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "row", width: "100%", height: "100vh", overflow: "hidden", backgroundColor: theme.palette.background.default }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ width: "100%", height: "100vh", overflow: "auto", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}