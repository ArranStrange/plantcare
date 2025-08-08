import { createTheme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    terracotta: Palette["primary"];
    sage: Palette["primary"];
  }

  interface PaletteOptions {
    terracotta?: PaletteOptions["primary"];
    sage?: PaletteOptions["primary"];
  }

  interface Theme {
    status: {
      danger: string;
    };
  }

  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#A8CBB7", // Pastel green
      light: "#C5DAD0",
      dark: "#7FAC9B",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#D96C3B", // Terracotta
      light: "#E5946A",
      dark: "#B5562B",
      contrastText: "#FFFFFF",
    },
    terracotta: {
      main: "#D96C3B",
      light: "#E5946A",
      dark: "#B5562B",
      contrastText: "#FFFFFF",
    },
    sage: {
      main: "#A8CBB7",
      light: "#C5DAD0",
      dark: "#7FAC9B",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8F6F1", // Off-white
      paper: "#FFFFFF",
    },
    text: {
      primary: "#6D6A75", // Warm grey
      secondary: "#8A8792",
    },
    success: {
      main: "#A8CBB7",
      light: "#C5DAD0",
      dark: "#7FAC9B",
    },
    warning: {
      main: "#E8B444",
      light: "#F0C866",
      dark: "#C59F33",
    },
    error: {
      main: "#E85C5C",
      light: "#EE7A7A",
      dark: "#C54A4A",
    },
    info: {
      main: "#7BB3D9",
      light: "#9BC5E3",
      dark: "#5C9ACF",
    },
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      letterSpacing: "-0.00833em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      letterSpacing: "0em",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "0.00735em",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
      letterSpacing: "0em",
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 500,
      letterSpacing: "0.0075em",
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 500,
      textTransform: "none" as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
  status: {
    danger: "#E85C5C",
  },
};

export const plantCareTheme = createTheme(themeOptions);

// Custom colors for plant status
export const statusColors = {
  overdue: "#E85C5C",
  dueToday: "#E8B444",
  watered: "#A8CBB7",
  upcoming: "#7BB3D9",
} as const;

export type StatusColor = keyof typeof statusColors;
