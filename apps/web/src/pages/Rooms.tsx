import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MeetingRoom as RoomIcon,
  LocalFlorist as PlantIcon,
} from "@mui/icons-material";
import { Room } from "@plantcare/types";
import { useApi } from "../contexts/ApiContext";

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await api.getRooms();
      setRooms(roomsData);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (room?: Room) => {
    setEditingRoom(room || null);
    setRoomName(room?.name || "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRoom(null);
    setRoomName("");
  };

  const handleSubmit = async () => {
    if (!roomName.trim()) return;

    try {
      setSubmitting(true);

      if (editingRoom) {
        await api.updateRoom(editingRoom.id, { name: roomName.trim() });
      } else {
        await api.createRoom({
          name: roomName.trim(),
          userId: "demo-user-id", // In a real app, this would come from auth
        });
      }

      await fetchRooms();
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save room:", err);
      setError("Failed to save room. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this room? Plants in this room will be moved to "No Room".'
      )
    ) {
      return;
    }

    try {
      await api.deleteRoom(roomId);
      await fetchRooms();
    } catch (err) {
      console.error("Failed to delete room:", err);
      setError("Failed to delete room. Make sure it has no plants first.");
    }
  };

  const getTotalPlantCount = () => {
    return rooms.reduce((total, room) => total + (room.plantCount || 0), 0);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          Rooms
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            minWidth: { xs: "100%", sm: "auto" },
          }}
        >
          Add New Room
        </Button>
      </Box>

      {/* Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                {rooms.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rooms
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "secondary.main" }}
              >
                {getTotalPlantCount()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Plants
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : rooms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <RoomIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
            No rooms yet!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Organize your plants by creating rooms like "Living Room",
            "Bedroom", or "Kitchen".
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Your First Room
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                      <RoomIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {room.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <PlantIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {room.plantCount || 0} plants
                    </Typography>
                  </Box>

                  {room.plants && room.plants.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: "block" }}
                      >
                        Recent plants:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {room.plants.slice(0, 3).map((plant) => (
                          <Chip
                            key={plant.id}
                            label={plant.name}
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/plant/${plant.id}`)}
                            sx={{ cursor: "pointer" }}
                          />
                        ))}
                        {room.plants.length > 3 && (
                          <Chip
                            label={`+${room.plants.length - 3} more`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <CardActions
                  sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                >
                  <Button
                    size="small"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    sx={{ color: "primary.main" }}
                  >
                    View Plants
                  </Button>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(room)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRoom(room.id)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Room Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g., Living Room, Bedroom, Kitchen"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!roomName.trim() || submitting}
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : editingRoom ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;
