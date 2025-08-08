import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  WaterDrop as WaterIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Room } from "@plantcare/types";
import { useApi } from "../contexts/ApiContext";

interface PlantTemplate {
  id: string;
  name: string;
  species: string;
  waterFrequency: number;
  careNotes: string;
  photoUrl: string;
}

interface TreflePlant {
  id: string;
  name: string;
  scientificName: string;
  family: string | null;
  genus: string | null;
  imageUrl: string | null;
  year: number | null;
  edible: boolean | null;
  ediblePart: string[] | null;
  edibleDescription: string | null;
  distribution: string | null;
}

// Mock plant templates - in a real app, this would come from an API
const PLANT_TEMPLATES: PlantTemplate[] = [
  {
    id: "1",
    name: "Fiddle Leaf Fig",
    species: "Ficus lyrata",
    waterFrequency: 7,
    careNotes:
      "Loves bright, indirect light. Water when top inch of soil is dry. Wipe leaves regularly.",
    photoUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
  },
  {
    id: "2",
    name: "Snake Plant",
    species: "Sansevieria trifasciata",
    waterFrequency: 14,
    careNotes:
      "Very low maintenance. Can tolerate low light and infrequent watering. Perfect for beginners.",
    photoUrl:
      "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400",
  },
  {
    id: "3",
    name: "Pothos",
    species: "Epipremnum aureum",
    waterFrequency: 5,
    careNotes:
      "Easy-going plant. Water when soil feels dry. Great for hanging baskets or trailing.",
    photoUrl:
      "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=400",
  },
  {
    id: "4",
    name: "Monstera Deliciosa",
    species: "Monstera deliciosa",
    waterFrequency: 7,
    careNotes:
      "Likes bright, indirect light. Provide support for climbing. Mist occasionally for humidity.",
    photoUrl: "https://images.unsplash.com/photo-1545239705-1564e58b1789?w=400",
  },
  {
    id: "5",
    name: "Rubber Plant",
    species: "Ficus elastica",
    waterFrequency: 10,
    careNotes:
      "Glossy leaves that need regular cleaning. Water moderately. Bright, indirect light preferred.",
    photoUrl: "https://images.unsplash.com/photo-1542052459-4d6c7d3b97ac?w=400",
  },
  {
    id: "6",
    name: "Peace Lily",
    species: "Spathiphyllum",
    waterFrequency: 5,
    careNotes:
      "Droops when thirsty - a great indicator plant! Loves humidity and indirect light.",
    photoUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
];

const AddPlant: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PlantTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customPlant, setCustomPlant] = useState({
    name: "",
    species: "",
    waterFrequency: 7,
    careNotes: "",
    photoUrl: "",
    roomId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Trefle API state
  const [treflePlants, setTreflePlants] = useState<TreflePlant[]>([]);
  const [trefleSearchQuery, setTrefleSearchQuery] = useState("");
  const [trefleLoading, setTrefleLoading] = useState(false);
  const [selectedTreflePlant, setSelectedTreflePlant] =
    useState<TreflePlant | null>(null);

  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const roomsData = await api.getRooms();
      setRooms(roomsData);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  const searchTreflePlants = async (query: string) => {
    if (!query.trim()) {
      setTreflePlants([]);
      return;
    }

    try {
      setTrefleLoading(true);
      const response = await api.searchPlants(query);
      setTreflePlants(response.plants);
    } catch (err) {
      console.error("Failed to search Trefle plants:", err);
      setError("Failed to search plants. Please try again.");
    } finally {
      setTrefleLoading(false);
    }
  };

  const handleTreflePlantSelect = (plant: TreflePlant) => {
    setSelectedTreflePlant(plant);
    setCustomPlant({
      name: plant.name,
      species: plant.scientificName,
      waterFrequency: 7, // Default value
      careNotes: `Scientific name: ${plant.scientificName}${
        plant.family ? `\nFamily: ${plant.family}` : ""
      }${plant.genus ? `\nGenus: ${plant.genus}` : ""}${
        plant.edibleDescription ? `\nEdible: ${plant.edibleDescription}` : ""
      }`,
      photoUrl: plant.imageUrl || "",
      roomId: customPlant.roomId,
    });
    setShowCustomForm(true);
  };

  const filteredTemplates = PLANT_TEMPLATES.filter(
    (plant) =>
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateSelect = (template: PlantTemplate) => {
    setSelectedTemplate(template);
    setCustomPlant({
      name: template.name,
      species: template.species,
      waterFrequency: template.waterFrequency,
      careNotes: template.careNotes,
      photoUrl: template.photoUrl,
      roomId: customPlant.roomId,
    });
    setShowCustomForm(true);
  };

  const handleCustomPlantChange = (field: string, value: string | number) => {
    setCustomPlant((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customPlant.name || !customPlant.species) {
      setError("Plant name and species are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.createPlant({
        name: customPlant.name,
        species: customPlant.species,
        waterFrequency: customPlant.waterFrequency,
        careNotes: customPlant.careNotes,
        photoUrl: customPlant.photoUrl,
        roomId: customPlant.roomId || undefined,
        userId: "demo-user-id", // In a real app, this would come from auth
      });

      navigate("/");
    } catch (err) {
      console.error("Failed to create plant:", err);
      setError("Failed to create plant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCustom = () => {
    setSelectedTemplate(null);
    setCustomPlant({
      name: "",
      species: "",
      waterFrequency: 7,
      careNotes: "",
      photoUrl: "",
      roomId: "",
    });
    setShowCustomForm(true);
  };

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 700, color: "text.primary" }}
      >
        Add New Plant
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!showCustomForm ? (
        <>
          {/* Search */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search for a plant type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Button
              variant="outlined"
              onClick={handleStartCustom}
              startIcon={<AddIcon />}
              sx={{ mt: 1 }}
            >
              Create Custom Plant
            </Button>
          </Paper>

          {/* Trefle Plant Database Search */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              🌿 Search Plant Database
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Search our comprehensive plant database for detailed information
            </Typography>

            <TextField
              fullWidth
              placeholder="Search plants by name, genus, or family..."
              value={trefleSearchQuery}
              onChange={(e) => {
                setTrefleSearchQuery(e.target.value);
                if (e.target.value.length >= 3) {
                  searchTreflePlants(e.target.value);
                } else {
                  setTreflePlants([]);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {trefleLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {treflePlants.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {treflePlants.slice(0, 6).map((plant) => (
                  <Grid item xs={12} sm={6} md={4} key={plant.id}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                        },
                      }}
                      onClick={() => handleTreflePlantSelect(plant)}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={
                          plant.imageUrl ||
                          "https://via.placeholder.com/300x200?text=No+Image"
                        }
                        alt={plant.name}
                      />
                      <CardContent sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {plant.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 1 }}
                        >
                          {plant.scientificName}
                        </Typography>
                        {plant.family && (
                          <Chip
                            label={plant.family}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                        {plant.genus && (
                          <Chip
                            label={plant.genus}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>

          {/* Plant Templates */}
          <Grid container spacing={3}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    },
                  }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={template.photoUrl}
                    alt={template.name}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {template.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {template.species}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <WaterIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      <Typography variant="caption">
                        Every {template.waterFrequency} days
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredTemplates.length === 0 && searchQuery && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
                No plants found
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, color: "text.secondary" }}
              >
                Can't find the plant you're looking for?
              </Typography>
              <Button
                variant="contained"
                onClick={handleStartCustom}
                startIcon={<AddIcon />}
              >
                Create Custom Plant
              </Button>
            </Paper>
          )}
        </>
      ) : (
        /* Custom Plant Form */
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedTemplate
                ? `Add ${selectedTemplate.name}`
                : "Create Custom Plant"}
            </Typography>
            {selectedTemplate && (
              <Chip
                label="Template"
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Plant Name"
                  value={customPlant.name}
                  onChange={(e) =>
                    handleCustomPlantChange("name", e.target.value)
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Species (Scientific Name)"
                  value={customPlant.species}
                  onChange={(e) =>
                    handleCustomPlantChange("species", e.target.value)
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Watering Frequency (days)"
                  type="number"
                  value={customPlant.waterFrequency}
                  onChange={(e) =>
                    handleCustomPlantChange(
                      "waterFrequency",
                      parseInt(e.target.value) || 7
                    )
                  }
                  inputProps={{ min: 1, max: 30 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Room</InputLabel>
                  <Select
                    value={customPlant.roomId}
                    onChange={(e) =>
                      handleCustomPlantChange("roomId", e.target.value)
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
                  label="Photo URL (optional)"
                  value={customPlant.photoUrl}
                  onChange={(e) =>
                    handleCustomPlantChange("photoUrl", e.target.value)
                  }
                  placeholder="https://example.com/plant-photo.jpg"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Care Notes"
                  value={customPlant.careNotes}
                  onChange={(e) =>
                    handleCustomPlantChange("careNotes", e.target.value)
                  }
                  multiline
                  rows={3}
                  placeholder="Add care instructions, light requirements, or other notes..."
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setShowCustomForm(false)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <AddIcon />
                }
              >
                {loading ? "Adding..." : "Add Plant"}
              </Button>
            </Box>
          </form>
        </Paper>
      )}
    </Box>
  );
};

export default AddPlant;
