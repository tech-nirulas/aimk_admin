"use client";

import { logout } from "@/features/auth/authSlice";
import { useConfirmDialog } from "@/lib/DialogProvider";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Avatar, Container, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaCog, FaSignOutAlt, FaUserAlt, FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "Custom Cakes", href: "#custom-cakes" },
];

export default function Navbar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef<HTMLDivElement>(null);

  const user = useSelector((state: { authReducer: { user } }) => {
    return state?.authReducer?.user?.data;
  });

  const dispatch = useDispatch();
  const { openDialog } = useConfirmDialog();

  const handleLogout = () => {
    openDialog('Are you sure you want to logout?', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      dispatch(logout());
      router.push("/auth/login");
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (isOpenRef.current && !isOpenRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getFirstCharacter = (word: string) => word?.charAt(0) || "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigation = (href: string) => {
    const isHomePage = pathname === "/";

    if (isHomePage) {
      // If on home page, just scroll to the section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If on another page, navigate to home page with the hash
      router.push(`/${href}`);
    }

    // Close mobile drawer if open
    if (drawerOpen) {
      setDrawerOpen(false);
    }
  };

  // Handle scroll after navigation from other pages
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [pathname]);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: scrolled
            ? `1px solid ${theme.palette.primary.light}40`
            : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Container maxWidth="lg" sx={{
          px: { xs: 1, md: 0 },
        }}>
          <Toolbar sx={{ justifyContent: "end", py: 0, px: 0 }}>

            {/* Desktop nav */}
            <Box
              component={motion.nav}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, alignItems: "center", justifyContent: "end" }}
            >
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  onClick={() => handleNavigation(link.href)}
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: "0.78rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    transition: "all 0.25s",
                    cursor: "pointer",
                    "&:hover": {
                      background: `${theme.palette.primary.main}18`,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <div className={`flex items-center gap-6 ${isOpen ? "block" : "hidden"} md:flex`}>
              <div className="relative" ref={isOpenRef}>
                <IconButton
                  color="inherit"
                  onClick={() => setIsOpen(!isOpen)}
                  size="large"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                >
                  <Avatar>{user && getFirstCharacter(user?.name?.toUpperCase())}</Avatar>
                </IconButton>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "absolute",
                        right: 0,
                        zIndex: 1300,
                      }}
                    >
                      <Paper elevation={4}
                        sx={{
                          width: 280,
                          color: theme.palette.common.white,
                          borderRadius: 2,
                        }}>
                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 2,
                        }}>
                          <Avatar>{user && getFirstCharacter(user?.firstName?.toUpperCase())}</Avatar>
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="subtitle1">
                              {user && `${user?.firstName} ${user?.lastName}`}
                            </Typography>
                            <Typography variant="body2">{user?.email}</Typography>
                            <Typography variant="caption">
                              {user && user.role?.roleName}
                            </Typography>
                          </Box>
                        </Box>
                        <List disablePadding>
                          {[
                            { label: "My Profile", icon: <FaUserAlt />, path: "/profile" },
                            { label: "Organization", icon: <FaCog />, path: "/organization" },
                            // { label: "Portal Settings", icon: <FaCog />, path: `/home/organization-details/${user?.company?.id}` },
                            { label: "3rd Party", icon: <FaUserCircle />, path: "/thirdParty" },
                            { label: "Logout", icon: <FaSignOutAlt />, action: handleLogout },
                          ].map((item, idx) => (
                            <ListItem
                              key={idx}
                              disablePadding
                            >
                              <ListItemButton
                                onClick={item.action || (() => router.push(item.path))}
                              >
                                <ListItemIcon sx={{ color: theme.palette.common.white }}>
                                  {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile menu */}
            <IconButton
              sx={{ display: { md: "none" }, color: theme.palette.primary.main }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: theme.palette.background.default,
            px: 2,
            pt: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(link.href)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {link.label}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ px: 2, mt: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleNavigation("#order")}
          >
            Order Now
          </Button>
        </Box>
      </Drawer>
    </>
  );
}