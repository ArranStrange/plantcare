import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  WaterDrop as WaterIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { PlantWithRoom } from '@plantcare/types';
import { statusColors } from '../../theme/plantCareTheme';
import { format, isToday, isPast, parseISO } from 'date-fns';

interface PlantCardProps {
  plant: PlantWithRoom;
  onWater: (plantId: string) => void;
  onCardClick: (plantId: string) => void;
  loading?: boolean;
}

const PlantCard: React.FC<PlantCardProps> = ({ 
  plant, 
  onWater, 
  onCardClick, 
  loading = false 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = useTheme();

  const getPlantStatus = () => {
    if (!plant.nextWaterDate) return { status: 'unknown', color: statusColors.upcoming };
    
    const nextWater = parseISO(plant.nextWaterDate);
    
    if (isPast(nextWater) && !isToday(nextWater)) {
      return { status: 'overdue', color: statusColors.overdue };
    }
    
    if (isToday(nextWater)) {
      return { status: 'due today', color: statusColors.dueToday };
    }
    
    return { status: 'upcoming', color: statusColors.upcoming };
  };

  const handleWaterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWater(plant.id);
  };

  const handleCardClick = () => {
    onCardClick(plant.id);
  };

  const handleFlipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const { status, color } = getPlantStatus();

  return (
    <Box 
      className={`plant-card ${isFlipped ? 'flipped' : ''}`}
      sx={{ 
        height: 320,
        cursor: 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'opacity 0.2s',
      }}
      onClick={handleCardClick}
    >
      <Box className="plant-card-inner">
        {/* Front of card */}
        <Card 
          className="plant-card-front"
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <CardMedia
            component="img"
            height="160"
            image={plant.photoUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'}
            alt={plant.name}
            sx={{ objectFit: 'cover' }}
          />
          
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {plant.name}
              </Typography>
              <IconButton
                size="small"
                onClick={handleFlipClick}
                sx={{ color: 'text.secondary' }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {plant.species}
            </Typography>
            
            {plant.room && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HomeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {plant.room.name}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {plant.nextWaterDate 
                  ? `Next: ${format(parseISO(plant.nextWaterDate), 'MMM d')}`
                  : 'Schedule watering'
                }
              </Typography>
            </Box>
            
            <Chip
              label={status}
              size="small"
              sx={{
                backgroundColor: color,
                color: 'white',
                fontWeight: 500,
                mb: 2,
              }}
            />
          </CardContent>
          
          <Box sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<WaterIcon />}
              onClick={handleWaterClick}
              disabled={loading || status === 'upcoming'}
              sx={{
                backgroundColor: status === 'upcoming' ? 'grey.300' : 'primary.main',
                '&:hover': {
                  backgroundColor: status === 'upcoming' ? 'grey.400' : 'primary.dark',
                },
              }}
            >
              {status === 'upcoming' ? 'Not Due Yet' : 'Water Now'}
            </Button>
          </Box>
        </Card>

        {/* Back of card */}
        <Card 
          className="plant-card-back"
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'sage.light',
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'sage.dark' }}>
                Care Tips
              </Typography>
              <IconButton
                size="small"
                onClick={handleFlipClick}
                sx={{ color: 'sage.dark' }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="body2" sx={{ color: 'sage.dark', lineHeight: 1.6, mb: 2 }}>
              {plant.careNotes || 'No care notes available yet. Add some care instructions to help you remember how to best care for this plant!'}
            </Typography>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="caption" sx={{ color: 'sage.dark', opacity: 0.8 }}>
                Waters every {plant.waterFrequency} days
              </Typography>
              {plant.lastWatered && (
                <Typography variant="caption" sx={{ color: 'sage.dark', opacity: 0.8, display: 'block' }}>
                  Last watered: {format(parseISO(plant.lastWatered), 'MMM d, yyyy')}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PlantCard;