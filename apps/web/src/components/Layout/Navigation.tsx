import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  MeetingRoom as RoomsIcon,
} from '@mui/icons-material';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigationItems = [
    { label: 'Dashboard', value: '/', icon: <DashboardIcon /> },
    { label: 'Calendar', value: '/calendar', icon: <CalendarIcon /> },
    { label: 'Add Plant', value: '/add-plant', icon: <AddIcon /> },
    { label: 'Rooms', value: '/rooms', icon: <RoomsIcon /> },
  ];

  const currentValue = location.pathname;

  const handleNavigation = (newValue: string) => {
    navigate(newValue);
  };

  if (isMobile) {
    return (
      <Paper
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
        elevation={8}
      >
        <BottomNavigation
          value={currentValue}
          onChange={(_, newValue) => handleNavigation(newValue)}
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiBottomNavigationAction-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          {navigationItems.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: 2,
      }}
    >
      <Tabs
        value={currentValue}
        onChange={(_, newValue) => handleNavigation(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
          },
        }}
      >
        {navigationItems.map((item) => (
          <Tab
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default Navigation;