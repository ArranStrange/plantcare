import React, { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  WaterDrop as WaterIcon,
  Grass as FertilizeIcon,
  LocalFlorist as RepotIcon,
} from "@mui/icons-material";
import { CalendarEvent } from "@plantcare/types";
import PlantCalendar from "../components/Calendar/PlantCalendar";
import { useApi } from "../contexts/ApiContext";
import { format } from "date-fns";

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const api = useApi();
  const theme = useTheme();

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleCompleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      await api.completeEvent(selectedEvent.id);
      // Close dialog and refresh calendar
      handleCloseDialog();
      // The calendar will refresh automatically when the parent component re-renders
    } catch (error) {
      console.error("Failed to complete event:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "watering":
        return <WaterIcon sx={{ color: "#7BB3D9" }} />;
      case "fertilising":
        return <FertilizeIcon sx={{ color: "#A8CBB7" }} />;
      case "repotting":
        return <RepotIcon sx={{ color: "#D96C3B" }} />;
      default:
        return <WaterIcon />;
    }
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.completed) return theme.palette.info.main;

    const eventDate = new Date(event.start);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) return theme.palette.error.main;
    if (eventDate.toDateString() === today.toDateString())
      return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 700, color: "text.primary" }}
      >
        Plant Care Calendar
      </Typography>

      <PlantCalendar onEventClick={handleEventClick} />

      {/* Event Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ backgroundColor: getEventColor(selectedEvent) }}>
                  {getEventIcon(selectedEvent.type)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedEvent.plantName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvent.type.charAt(0).toUpperCase() +
                      selectedEvent.type.slice(1)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Date:</strong>{" "}
                  {format(new Date(selectedEvent.start), "EEEE, MMMM d, yyyy")}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Time:</strong>{" "}
                  {format(new Date(selectedEvent.start), "h:mm a")}
                </Typography>

                <Chip
                  label={selectedEvent.completed ? "Completed" : "Pending"}
                  color={selectedEvent.completed ? "success" : "warning"}
                  variant="filled"
                />
              </Box>

              {!selectedEvent.completed && (
                <Typography variant="body2" color="text.secondary">
                  Mark this task as completed when you've finished caring for
                  your plant.
                </Typography>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {!selectedEvent.completed && (
                <Button
                  variant="contained"
                  onClick={handleCompleteEvent}
                  disabled={loading}
                  startIcon={getEventIcon(selectedEvent.type)}
                >
                  Mark Complete
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Calendar;
