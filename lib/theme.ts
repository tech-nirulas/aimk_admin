import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DARK THEME — Professional & Modern
// Primary: Indigo/Blue tones for admin feel
// ─────────────────────────────────────────────────────────────────────────────

const PALETTE = {
  primary: {
    main: "#6366F1",       // Indigo 500 - modern admin blue
    light: "#818CF8",      // Indigo 400
    dark: "#4F46E5",       // Indigo 600
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#8B5CF6",       // Violet 500
    light: "#A78BFA",      // Violet 400
    dark: "#7C3AED",       // Violet 600
    contrastText: "#FFFFFF",
  },
  accent: {
    success: "#10B981",    // Emerald 500
    warning: "#F59E0B",    // Amber 500
    error: "#EF4444",      // Red 500
    info: "#3B82F6",       // Blue 500
  },
  background: {
    default: "#0F172A",    // Slate 900 - main background
    accent: "#1E293B",     // Slate 800 - elevated surfaces
    paper: "#1E293B",      // Slate 800
    surface: "#334155",    // Slate 700 - hover states
  },
  text: {
    primary: "#F1F5F9",    // Slate 100
    secondary: "#94A3B8",  // Slate 400
    disabled: "#64748B",   // Slate 500
    hint: "#818CF8",       // Indigo 400
  },
  error: {
    main: "#EF4444",       // Red 500
    light: "#FCA5A5",      // Red 300
    dark: "#DC2626",       // Red 600
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#F59E0B",       // Amber 500
    light: "#FBBF24",      // Amber 400
    dark: "#D97706",       // Amber 600
    contrastText: "#000000",
  },
  success: {
    main: "#10B981",       // Emerald 500
    light: "#34D399",      // Emerald 400
    dark: "#059669",       // Emerald 600
    contrastText: "#FFFFFF",
  },
  info: {
    main: "#3B82F6",       // Blue 500
    light: "#60A5FA",      // Blue 400
    dark: "#2563EB",       // Blue 600
    contrastText: "#FFFFFF",
  },
  divider: "#334155",      // Slate 700
  grey: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
};

const TYPOGRAPHY = {
  fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
  displayFont: '"Inter", "Segoe UI", sans-serif',
  monoFont: '"JetBrains Mono", "Fira Code", monospace',
  bodyFont: '"Inter", "Segoe UI", sans-serif',
};

const SHAPE = {
  borderRadius: 8,
};

const SHADOWS_CUSTOM = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  glow: "0 0 0 2px rgba(99, 102, 241, 0.4)",  // Primary focus ring
};

// ─────────────────────────────────────────────────────────────────────────────

let theme = createTheme({
  palette: {
    mode: "dark",
    primary: PALETTE.primary,
    secondary: PALETTE.secondary,
    error: PALETTE.error,
    warning: PALETTE.warning,
    info: PALETTE.info,
    success: PALETTE.success,
    background: PALETTE.background,
    text: PALETTE.text,
    divider: PALETTE.divider,
    grey: PALETTE.grey,
    action: {
      hover: "rgba(99, 102, 241, 0.08)",
      selected: "rgba(99, 102, 241, 0.12)",
      disabled: "rgba(148, 163, 184, 0.3)",
      disabledBackground: "rgba(148, 163, 184, 0.12)",
      focus: "rgba(99, 102, 241, 0.2)",
      active: PALETTE.primary.main,
    },
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily,
    h1: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 700,
      fontSize: "2.5rem",
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
      color: PALETTE.text.primary,
    },
    h2: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 600,
      fontSize: "2rem",
      letterSpacing: "-0.01em",
      lineHeight: 1.3,
      color: PALETTE.text.primary,
    },
    h3: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 600,
      fontSize: "1.75rem",
      lineHeight: 1.3,
      color: PALETTE.text.primary,
    },
    h4: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
      color: PALETTE.text.primary,
    },
    h5: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 500,
      fontSize: "1.25rem",
      color: PALETTE.text.primary,
    },
    h6: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 500,
      fontSize: "1rem",
      color: PALETTE.text.primary,
    },
    subtitle1: {
      fontFamily: TYPOGRAPHY.bodyFont,
      fontSize: "0.875rem",
      fontWeight: 500,
      letterSpacing: "0.01em",
      color: PALETTE.text.secondary,
    },
    subtitle2: {
      fontFamily: TYPOGRAPHY.bodyFont,
      fontSize: "0.75rem",
      fontWeight: 500,
      letterSpacing: "0.01em",
      color: PALETTE.text.secondary,
    },
    body1: {
      fontFamily: TYPOGRAPHY.bodyFont,
      fontSize: "0.875rem",
      lineHeight: 1.6,
      color: PALETTE.text.primary,
    },
    body2: {
      fontFamily: TYPOGRAPHY.bodyFont,
      fontSize: "0.8125rem",
      lineHeight: 1.6,
      color: PALETTE.text.secondary,
    },
    button: {
      fontFamily: TYPOGRAPHY.bodyFont,
      fontSize: "0.8125rem",
      fontWeight: 600,
      letterSpacing: "0.01em",
      textTransform: "none" as const,
    },
    caption: {
      fontFamily: TYPOGRAPHY.bodyFont,
      fontSize: "0.75rem",
      color: PALETTE.text.secondary,
    },
    overline: {
      fontFamily: TYPOGRAPHY.bodyFont,
      fontSize: "0.625rem",
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    },
  },
  shape: {
    borderRadius: SHAPE.borderRadius,
  },
  shadows: [
    "none",
    SHADOWS_CUSTOM.sm,
    SHADOWS_CUSTOM.md,
    SHADOWS_CUSTOM.lg,
    SHADOWS_CUSTOM.xl,
    ...Array(20).fill(SHADOWS_CUSTOM.md),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --color-primary: ${PALETTE.primary.main};
          --color-primary-light: ${PALETTE.primary.light};
          --color-primary-dark: ${PALETTE.primary.dark};
          --color-secondary: ${PALETTE.secondary.main};
          --color-background: ${PALETTE.background.default};
          --color-surface: ${PALETTE.background.paper};
          --color-text: ${PALETTE.text.primary};
          --color-text-secondary: ${PALETTE.text.secondary};
          --shadow-sm: ${SHADOWS_CUSTOM.sm};
          --shadow-md: ${SHADOWS_CUSTOM.md};
          --shadow-lg: ${SHADOWS_CUSTOM.lg};
          --shadow-xl: ${SHADOWS_CUSTOM.xl};
          --shadow-glow: ${SHADOWS_CUSTOM.glow};
          --font-family: ${TYPOGRAPHY.fontFamily};
          --radius: ${SHAPE.borderRadius}px;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background-color: ${PALETTE.background.default};
          color: ${PALETTE.text.primary};
          font-family: ${TYPOGRAPHY.bodyFont};
          overflow-x: hidden;
        }

        ::selection {
          background: ${PALETTE.primary.main}40;
          color: ${PALETTE.primary.light};
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${PALETTE.background.accent};
        }

        ::-webkit-scrollbar-thumb {
          background: ${PALETTE.grey[600]};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${PALETTE.grey[500]};
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: SHAPE.borderRadius,
          padding: "6px 16px",
          transition: "all 0.2s ease",
          textTransform: "none",
          fontWeight: 500,
        },
        containedPrimary: {
          background: PALETTE.primary.main,
          boxShadow: SHADOWS_CUSTOM.sm,
          "&:hover": {
            background: PALETTE.primary.dark,
            boxShadow: SHADOWS_CUSTOM.md,
          },
        },
        containedSecondary: {
          background: PALETTE.secondary.main,
          "&:hover": {
            background: PALETTE.secondary.dark,
          },
        },
        outlined: {
          borderColor: PALETTE.grey[600],
          "&:hover": {
            borderColor: PALETTE.primary.main,
            background: `${PALETTE.primary.main}10`,
          },
        },
        text: {
          "&:hover": {
            background: `${PALETTE.primary.main}10`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: PALETTE.background.paper,
          borderRadius: SHAPE.borderRadius * 2,
          boxShadow: SHADOWS_CUSTOM.sm,
          border: `1px solid ${PALETTE.divider}`,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: "16px 20px",
          borderBottom: `1px solid ${PALETTE.divider}`,
        },
        title: {
          fontSize: "1rem",
          fontWeight: 600,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "20px",
          "&:last-child": {
            paddingBottom: "20px",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: PALETTE.background.paper,
          borderRight: `1px solid ${PALETTE.divider}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `${PALETTE.background.paper}CC`,
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${PALETTE.divider}`,
          boxShadow: SHADOWS_CUSTOM.sm,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: PALETTE.background.paper,
        },
        elevation1: {
          boxShadow: SHADOWS_CUSTOM.sm,
        },
        elevation2: {
          boxShadow: SHADOWS_CUSTOM.md,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: SHAPE.borderRadius,
          margin: "4px 8px",
          padding: "8px 12px",
          "&.Mui-selected": {
            backgroundColor: `${PALETTE.primary.main}20`,
            "&:hover": {
              backgroundColor: `${PALETTE.primary.main}30`,
            },
            "& .MuiListItemText-primary": {
              color: PALETTE.primary.light,
              fontWeight: 600,
            },
          },
          "&:hover": {
            backgroundColor: `${PALETTE.primary.main}10`,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: PALETTE.text.secondary,
          minWidth: 36,
          "&.Mui-selected": {
            color: PALETTE.primary.light,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: "0.875rem",
          fontWeight: 500,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: PALETTE.divider,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: SHAPE.borderRadius,
          fontSize: "0.75rem",
          fontWeight: 500,
        },
        filledPrimary: {
          background: PALETTE.primary.main,
          color: "#FFFFFF",
        },
        outlined: {
          borderColor: PALETTE.grey[600],
          color: PALETTE.text.secondary,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: PALETTE.background.accent,
          "& .MuiTableCell-root": {
            fontWeight: 600,
            color: PALETTE.text.secondary,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${PALETTE.divider}`,
          padding: "12px 16px",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: `${PALETTE.primary.main}05`,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: PALETTE.text.secondary,
          "&:hover": {
            backgroundColor: `${PALETTE.primary.main}10`,
            color: PALETTE.primary.light,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: PALETTE.background.accent,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.grey[500],
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: PALETTE.primary.main,
            borderWidth: 2,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: PALETTE.text.secondary,
          "&.Mui-focused": {
            color: PALETTE.primary.main,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: PALETTE.text.secondary,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: PALETTE.background.paper,
          border: `1px solid ${PALETTE.divider}`,
          boxShadow: SHADOWS_CUSTOM.lg,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: `${PALETTE.primary.main}10`,
          },
          "&.Mui-selected": {
            backgroundColor: `${PALETTE.primary.main}20`,
            "&:hover": {
              backgroundColor: `${PALETTE.primary.main}30`,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: SHAPE.borderRadius,
        },
        standardSuccess: {
          backgroundColor: `${PALETTE.success.main}20`,
          color: PALETTE.success.light,
        },
        standardError: {
          backgroundColor: `${PALETTE.error.main}20`,
          color: PALETTE.error.light,
        },
        standardWarning: {
          backgroundColor: `${PALETTE.warning.main}20`,
          color: PALETTE.warning.light,
        },
        standardInfo: {
          backgroundColor: `${PALETTE.info.main}20`,
          color: PALETTE.info.light,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: "0.7rem",
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: PALETTE.grey[700],
          fontSize: "0.75rem",
          borderRadius: SHAPE.borderRadius,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme, { factor: 1.5 });

export default theme;
export { PALETTE, SHADOWS_CUSTOM, TYPOGRAPHY };