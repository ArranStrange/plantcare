import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PlantWithRoom } from '@plantcare/types';
import { useApi } from '../contexts/ApiContext';
import PlantCard from '../components/Plant/PlantCard';
import { parseISO, isToday, isPast } from 'date-fns';

const Dashboard: React.FC = () => {
  const [plants, setPlants] = useState<PlantWithRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wateringPlant, setWateringPlant] = useState<string | null>(null);
  const api = useApi();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      setError(null);
      const plantsData = await api.getPlants();
      setPlants(plantsData);
    } catch (err) {
      console.error('Failed to fetch plants:', err);
      setError('Failed to load plants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWaterPlant = async (plantId: string) => {
    try {
      setWateringPlant(plantId);
      await api.waterPlant(plantId);
      // Refresh plants to show updated status
      await fetchPlants();
    } catch (err) {
      console.error('Failed to water plant:', err);
      setError('Failed to water plant. Please try again.');
    } finally {
      setWateringPlant(null);
    }
  };

  const handlePlantClick = (plantId: string) => {
    navigate(`/plant/${plantId}`);
  };

  const categorizedPlants = React.useMemo(() => {
    const overdue: PlantWithRoom[] = [];
    const dueToday: PlantWithRoom[] = [];
    const upcoming: PlantWithRoom[] = [];

    plants.forEach(plant => {
      if (!plant.nextWaterDate) {
        upcoming.push(plant);
        return;
      }

      const nextWater = parseISO(plant.nextWaterDate);
      
      if (isPast(nextWater) && !isToday(nextWater)) {
        overdue.push(plant);
      } else if (isToday(nextWater)) {
        dueToday.push(plant);
      } else {
        upcoming.push(plant);
      }
    });

    return { overdue, dueToday, upcoming };
  }, [plants]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          My Plants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-plant')}
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          Add New Plant
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : plants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            No plants yet!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Start your plant care journey by adding your first plant.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-plant')}
          >
            Add Your First Plant
          </Button>
        </Paper>
      ) : (
        <Box>
          {/* Plant Status Summary */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip
              label={`${categorizedPlants.overdue.length} Overdue`}
              color="error"
              variant={categorizedPlants.overdue.length > 0 ? 'filled' : 'outlined'}
            />
            <Chip
              label={`${categorizedPlants.dueToday.length} Due Today`}
              color="warning"
              variant={categorizedPlants.dueToday.length > 0 ? 'filled' : 'outlined'}
            />
            <Chip
              label={`${categorizedPlants.upcoming.length} Upcoming`}
              color="info"
              variant={categorizedPlants.upcoming.length > 0 ? 'filled' : 'outlined'}
            />
          </Box>

          {/* Overdue Plants */}
          {categorizedPlants.overdue.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'error.main', fontWeight: 600 }}>
                🚨 Overdue
              </Typography>
              <Grid container spacing={3}>
                {categorizedPlants.overdue.map((plant) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={plant.id}>
                    <PlantCard
                      plant={plant}
                      onWater={handleWaterPlant}
                      onCardClick={handlePlantClick}
                      loading={wateringPlant === plant.id}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Due Today */}
          {categorizedPlants.dueToday.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'warning.main', fontWeight: 600 }}>
                ⏰ Due Today
              </Typography>
              <Grid container spacing={3}>
                {categorizedPlants.dueToday.map((plant) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={plant.id}>
                    <PlantCard
                      plant={plant}
                      onWater={handleWaterPlant}
                      onCardClick={handlePlantClick}
                      loading={wateringPlant === plant.id}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Upcoming */}
          {categorizedPlants.upcoming.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                🌱 All Plants
              </Typography>
              <Grid container spacing={3}>
                {categorizedPlants.upcoming.map((plant) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={plant.id}>
                    <PlantCard
                      plant={plant}
                      onWater={handleWaterPlant}
                      onCardClick={handlePlantClick}
                      loading={wateringPlant === plant.id}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;