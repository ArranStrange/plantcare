import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  WaterDrop as RainIcon,
} from '@mui/icons-material';
import { useApi } from '../../contexts/ApiContext';

const WeatherBanner: React.FC = () => {
  const [weatherData, setWeatherData] = useState<{
    weather: { humidity: number; temperature: number; rainedRecently: boolean };
    recommendations: Array<{ type: string; message: string; icon: string }>;
  } | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const api = useApi();
  const theme = useTheme();

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // If location access is denied, fetch weather without location
          fetchWeatherRecommendations();
        }
      );
    } else {
      fetchWeatherRecommendations();
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchWeatherRecommendations(userLocation.lat, userLocation.lon);
    }
  }, [userLocation]);

  const fetchWeatherRecommendations = async (lat?: number, lon?: number) => {
    try {
      const data = await api.getWeatherRecommendations(lat, lon);
      setWeatherData(data);
    } catch (error) {
      console.error('Failed to fetch weather recommendations:', error);
    }
  };

  const getWeatherIcon = () => {
    if (!weatherData) return <CloudIcon />;
    
    const { humidity, rainedRecently } = weatherData.weather;
    
    if (rainedRecently) return <RainIcon sx={{ color: '#7BB3D9' }} />;
    if (humidity > 70) return <CloudIcon sx={{ color: '#8A8792' }} />;
    return <SunnyIcon sx={{ color: '#E8B444' }} />;
  };

  const getAlertSeverity = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  if (!weatherData || !showBanner || weatherData.recommendations.length === 0) {
    return null;
  }

  const primaryRecommendation = weatherData.recommendations[0];

  return (
    <Collapse in={showBanner}>
      <Alert
        severity={getAlertSeverity(primaryRecommendation.type)}
        icon={getWeatherIcon()}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setShowBanner(false)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" component="span">
            {primaryRecommendation.message}
          </Typography>
          {weatherData.weather && (
            <Typography variant="caption" color="text.secondary">
              ({weatherData.weather.temperature}°C, {weatherData.weather.humidity}% humidity)
            </Typography>
          )}
        </Box>
      </Alert>
    </Collapse>
  );
};

export default WeatherBanner;