import React, { ReactNode } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Park as EcoIcon } from "@mui/icons-material";
import Navigation from "./Navigation";
import WeatherBanner from "../Weather/WeatherBanner";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            aria-label="logo"
            sx={{ mr: 2 }}
          >
            <EcoIcon sx={{ fontSize: 32 }} />
          </IconButton>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              color: "primary.main",
              fontWeight: 700,
            }}
          >
            PlantCare
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Weather Banner */}
      <WeatherBanner />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 2, md: 3 },
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
};

export default Layout;
