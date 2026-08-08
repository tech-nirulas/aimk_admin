"use client";

import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store";
import { hasModuleAccess } from "@/helpers/permission.helper";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const authState = useAppSelector((state: any) => state.authReducer);
  const user = authState?.user;
  const isLoading = authState?.isLoading;

  const isAllowed = hasModuleAccess(user, pathname);

  return (
    <Box sx={{ display: "flex", flexDirection: "row", width: "100%", height: "100vh", overflow: "hidden", backgroundColor: theme.palette.background.default }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ width: "100%", height: "100vh", overflow: "auto", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Box sx={{ p: 3, flex: 1 }}>
          {!isLoading && !isAllowed ? (
            <Paper className="p-8 text-center max-w-lg mx-auto mt-12 border border-red-200 bg-red-50/50 shadow-sm">
              <Box className="flex justify-center mb-4 text-red-500">
                <LockOutlinedIcon sx={{ fontSize: 64 }} />
              </Box>
              <Typography variant="h4" className="font-extrabold text-gray-800 mb-2">
                Access Denied (403)
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-6">
                Your assigned role <strong>({user?.role?.name || "Staff"})</strong> does not have permission to access the route <code>{pathname}</code>.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push("/admin")}
              >
                Go to Dashboard
              </Button>
            </Paper>
          ) : (
            children
          )}
        </Box>
      </Box>
    </Box>
  );
}