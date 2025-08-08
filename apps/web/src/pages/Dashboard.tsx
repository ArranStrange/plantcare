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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Add as AddIcon, Sort as SortIcon, WaterDrop as WaterDropIcon } from '@mui/icons-material';
import { PlantWithRoom } from '@plantcare/types';
import { useApi } from '../contexts/ApiContext';
import PlantCard from '../components/Plant/PlantCard';
import { parseISO, isToday, isPast, formatDistanceToNow } from 'date-fns';

type SortMode = 'watering' | 'name' | 'room';

const Dashboard: React.FC = () => {
  const [plants, setPlants] = useState<PlantWithRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wateringPlant, setWateringPlant] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('watering');
  const api = useApi();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchPlants();
  }, [sortMode]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      setError(null);
      let plantsData: PlantWithRoom[];
      
      if (sortMode === 'watering') {
        plantsData = await api.getPlantsSortedByWatering();
      } else {
        plantsData = await api.getPlants();
        // Client-side sorting for name and room
        if (sortMode === 'name') {
          plantsData.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMode === 'room') {
          plantsData.sort((a, b) => {
            const roomA = a.room?.name || 'No Room';
            const roomB = b.room?.name || 'No Room';
            return roomA.localeCompare(roomB);
          });
        }
      }
      
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

  const handleSortChange = (event: React.MouseEvent<HTMLElement>, newSortMode: SortMode | null) => {
    if (newSortMode !== null) {
      setSortMode(newSortMode);
    }
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

  const getWateringPriorityText = (plant: PlantWithRoom) => {
    if (!plant.nextWaterDate) return 'No schedule';
    
    const nextWater = parseISO(plant.nextWaterDate);
    
    if (isPast(nextWater) && !isToday(nextWater)) {
      const daysOverdue = Math.ceil((Date.now() - nextWater.getTime()) / (1000 * 60 * 60 * 24));
      return `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
    }
    
    if (isToday(nextWater)) {
      return 'Due today';
    }
    
    return `Due in ${formatDistanceToNow(nextWater, { addSuffix: true })}`;
  };

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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <ToggleButtonGroup
            value={sortMode}
            exclusive
            onChange={handleSortChange}
            size="small"
            sx={{ 
              '& .MuiToggleButton-root': { 
                px: 2, 
                py: 1,
                fontSize: '0.875rem',
              }
            }}
          >
            <ToggleButton value="watering" aria-label="sort by watering">
              <WaterDropIcon sx={{ mr: 1, fontSize: 16 }} />
              Watering
            </ToggleButton>
            <ToggleButton value="name" aria-label="sort by name">
              <SortIcon sx={{ mr: 1, fontSize: 16 }} />
              Name
            </ToggleButton>
            <ToggleButton value="room" aria-label="sort by room">
              <SortIcon sx={{ mr: 1, fontSize: 16 }} />
              Room
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-plant')}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            Add Plant
          </Button>
        </Box>
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

          {/* Plants List - Organized by watering priority when sorting by watering */}
          {sortMode === 'watering' ? (
            <Box>
              {/* Overdue Plants */}
              {categorizedPlants.overdue.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'error.main', fontWeight: 600 }}>
                    🚨 Overdue ({categorizedPlants.overdue.length})
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
                    ⏰ Due Today ({categorizedPlants.dueToday.length})
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
                    🌱 Upcoming ({categorizedPlants.upcoming.length})
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
          ) : (
            /* Simple grid for other sort modes */
            <Grid container spacing={3}>
              {plants.map((plant) => (
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
          )}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;