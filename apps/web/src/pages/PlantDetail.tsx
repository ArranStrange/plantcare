import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WaterDrop as WaterIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  LocalFlorist as EventIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { Plant, Room, CareEvent } from "@plantcare/types";
import { useApi } from "../contexts/ApiContext";
import { format, parseISO } from "date-fns";
import { statusColors } from "../theme/plantCareTheme";

const PlantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [watering, setWatering] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    species: "",
    waterFrequency: 7,
    careNotes: "",
    photoUrl: "",
    roomId: "",
  });

  const api = useApi();
  const theme = useTheme();

  useEffect(() => {
    if (id) {
      fetchPlantDetails();
      fetchRooms();
      fetchPlantEvents();
    }
  }, [id]);

  const fetchPlantDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const plantData = await api.getPlant(id);
      setPlant(plantData);

      // Initialize edit form
      setEditForm({
        name: plantData.name,
        species: plantData.species,
        waterFrequency: plantData.waterFrequency,
        careNotes: plantData.careNotes || "",
        photoUrl: plantData.photoUrl || "",
        roomId: plantData.roomId || "",
      });
    } catch (err) {
      console.error("Failed to fetch plant:", err);
      setError("Failed to load plant details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const roomsData = await api.getRooms();
      setRooms(roomsData);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  const fetchPlantEvents = async () => {
    if (!id) return;

    try {
      const eventsData = await api.getPlantEvents(id, 10);
      setEvents(eventsData);
    } catch (err) {
      console.error("Failed to fetch plant events:", err);
    }
  };

  const handleWaterPlant = async () => {
    if (!id) return;

    try {
      setWatering(true);
      await api.waterPlant(id);
      await fetchPlantDetails();
      await fetchPlantEvents();
    } catch (err) {
      console.error("Failed to water plant:", err);
      setError("Failed to water plant. Please try again.");
    } finally {
      setWatering(false);
    }
  };

  const handleUpdatePlant = async () => {
    if (!id) return;

    try {
      setSubmitting(true);
      await api.updatePlant(id, {
        ...editForm,
        roomId: editForm.roomId || undefined,
      });
      await fetchPlantDetails();
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to update plant:", err);
      setError("Failed to update plant. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlant = async () => {
    if (!id) return;

    try {
      setSubmitting(true);
      await api.deletePlant(id);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete plant:", err);
      setError("Failed to delete plant. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPlantStatus = () => {
    if (!plant?.nextWaterDate)
      return { status: "unknown", color: statusColors.upcoming };

    const nextWater = parseISO(plant.nextWaterDate);
    const now = new Date();

    if (nextWater < now) {
      return { status: "overdue", color: statusColors.overdue };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const waterDate = new Date(nextWater);
    waterDate.setHours(0, 0, 0, 0);

    if (waterDate.getTime() === today.getTime()) {
      return { status: "due today", color: statusColors.dueToday };
    }

    return { status: "upcoming", color: statusColors.upcoming };
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "watering":
        return <WaterIcon sx={{ color: theme.palette.info.main }} />;
      case "fertilising":
        return <EventIcon sx={{ color: theme.palette.success.main }} />;
      case "repotting":
        return <EventIcon sx={{ color: theme.palette.secondary.main }} />;
      default:
        return <EventIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !plant) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || "Plant not found"}
      </Alert>
    );
  }

  const { status, color } = getPlantStatus();

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/")} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "text.primary", flexGrow: 1 }}
        >
          {plant.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => setEditDialogOpen(true)}>
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Plant Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "fit-content" }}>
            <CardMedia
              component="img"
              height="300"
              image={
                plant.photoUrl ||
                "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
              }
              alt={plant.name}
              sx={{ objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {plant.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {plant.species}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <Chip
                  label={status}
                  sx={{
                    backgroundColor: color,
                    color: "white",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={<ScheduleIcon />}
                  label={`Every ${plant.waterFrequency} days`}
                  variant="outlined"
                />
              </Box>

              {plant.roomId && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <HomeIcon
                    sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Room:{" "}
                    {rooms.find((r) => r.id === plant.roomId)?.name ||
                      "Unknown"}
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<WaterIcon />}
                onClick={handleWaterPlant}
                disabled={watering || status === "upcoming"}
                sx={{
                  backgroundColor:
                    status === "upcoming" ? "grey.300" : "primary.main",
                  "&:hover": {
                    backgroundColor:
                      status === "upcoming" ? "grey.400" : "primary.dark",
                  },
                }}
              >
                {watering ? (
                  <CircularProgress size={20} />
                ) : status === "upcoming" ? (
                  "Not Due Yet"
                ) : (
                  "Water Now"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Plant Info & Events */}
        <Grid item xs={12} md={6}>
          {/* Care Notes */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Care Notes
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {plant.careNotes || "No care notes available yet."}
            </Typography>
          </Paper>

          {/* Watering Schedule */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Watering Schedule
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Frequency: Every {plant.waterFrequency} days
              </Typography>
              {plant.lastWatered && (
                <Typography variant="body2" color="text.secondary">
                  Last watered:{" "}
                  {format(parseISO(plant.lastWatered), "EEEE, MMMM d, yyyy")}
                </Typography>
              )}
              {plant.nextWaterDate && (
                <Typography variant="body2" color="text.secondary">
                  Next watering:{" "}
                  {format(parseISO(plant.nextWaterDate), "EEEE, MMMM d, yyyy")}
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Recent Events */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Care Events
            </Typography>
            {events.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No care events recorded yet.
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {events.map((event, index) => (
                  <React.Fragment key={event.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>{getEventIcon(event.type)}</ListItemIcon>
                      <ListItemText
                        primary={`${
                          event.type.charAt(0).toUpperCase() +
                          event.type.slice(1)
                        }`}
                        secondary={format(
                          parseISO(event.date),
                          "MMM d, yyyy - h:mm a"
                        )}
                      />
                      <Chip
                        label={event.completed ? "Completed" : "Pending"}
                        size="small"
                        color={event.completed ? "success" : "warning"}
                        variant="outlined"
                      />
                    </ListItem>
                    {index < events.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit {plant.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Plant Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Species"
                value={editForm.species}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, species: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Watering Frequency (days)"
                type="number"
                value={editForm.waterFrequency}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    waterFrequency: parseInt(e.target.value) || 7,
                  }))
                }
                inputProps={{ min: 1, max: 30 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Room</InputLabel>
                <Select
                  value={editForm.roomId}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, roomId: e.target.value }))
                  }
                  label="Room"
                >
                  <MenuItem value="">No room</MenuItem>
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Photo URL"
                value={editForm.photoUrl}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, photoUrl: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Care Notes"
                value={editForm.careNotes}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    careNotes: e.target.value,
                  }))
                }
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdatePlant}
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={20} /> : <SaveIcon />
            }
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete {plant.name}?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this plant? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeletePlant}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlantDetail;
