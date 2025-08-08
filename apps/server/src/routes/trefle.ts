import express from "express";
import axios from "axios";

// Define types for Trefle API responses
interface TreflePlant {
  id: number;
  common_name: string | null;
  scientific_name: string;
  family: string | null;
  genus: string | null;
  year: number | null;
  bibliography: string | null;
  author: string | null;
  family_common_name: string | null;
  genus_id: number | null;
  observations: string | null;
  vegetable: boolean | null;
  edible: boolean | null;
  edible_part: string[] | null;
  edible_description: string | null;
  distribution: string | null;
  distribution_map: string | null;
  flower: {
    color: string[] | null;
    conspicuous: boolean | null;
  } | null;
  foliage: {
    texture: string | null;
    color: string[] | null;
    leaf_retention: boolean | null;
  } | null;
  fruit_or_seed: {
    conspicuous: boolean | null;
    color: string[] | null;
    shape: string | null;
    seed_persistence: boolean | null;
  } | null;
  specifications: {
    ligneous_type: string | null;
    growth_form: string | null;
    growth_habit: string | null;
    growth_rate: string | null;
    average_height: {
      cm: number | null;
    } | null;
    maximum_height: {
      cm: number | null;
    } | null;
    nitrogen_fixation: string | null;
    shape_and_orientation: string | null;
    toxicity: string | null;
  } | null;
  growth: {
    description: string | null;
    sowing: string | null;
    days_to_harvest: number | null;
    row_spacing: {
      cm: number | null;
    } | null;
    spread: {
      cm: number | null;
    } | null;
    ph_maximum: number | null;
    ph_minimum: number | null;
    light: number | null;
    atmospheric_humidity: number | null;
    growth_months: string[] | null;
    bloom_months: string[] | null;
    fruit_months: string[] | null;
    minimum_precipitation: {
      mm: number | null;
    } | null;
    maximum_precipitation: {
      mm: number | null;
    } | null;
    minimum_root_depth: {
      cm: number | null;
    } | null;
    minimum_temperature: {
      deg_f: number | null;
      deg_c: number | null;
    } | null;
    maximum_temperature: {
      deg_f: number | null;
      deg_c: number | null;
    } | null;
    soil_nutriments: number | null;
    soil_salinity: number | null;
    soil_texture: number | null;
    soil_humidity: number | null;
  } | null;
  links: {
    self: string;
    plant: string;
    genus: string;
  };
  image_url: string | null;
}

interface TrefleSearchResponse {
  data: TreflePlant[];
  links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
  meta: {
    total: number;
  };
}

interface TreflePlantDetail {
  data: TreflePlant;
}

const router = express.Router();

// Search for plants by name
router.get("/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const rapidApiKey =
      process.env.RAPIDAPI_KEY ||
      "d8b929cdbdmsh553ee72c5a94b44p1aca16jsn8b00023c66fd";

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    try {
      const response = await axios.get(
        `https://house-plants2.p.rapidapi.com/search`,
        {
          params: {
            query: q,
          },
          headers: {
            "x-rapidapi-host": "house-plants2.p.rapidapi.com",
            "x-rapidapi-key": rapidApiKey,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      // Transform the response to match our app's format
      const plants = response.data.map((plant: any, index: number) => ({
        id: plant.id?.toString() || `rapidapi-${index}`,
        name:
          plant.name ||
          plant.common_name ||
          plant.scientific_name ||
          "Unknown Plant",
        scientificName: plant.scientific_name || plant.name || "",
        family: plant.family || null,
        genus: plant.genus || null,
        imageUrl: plant.image_url || plant.image || null,
        year: plant.year || null,
        edible: plant.edible || false,
        ediblePart: plant.edible_part || null,
        edibleDescription: plant.edible_description || null,
        distribution: plant.distribution || plant.origin || null,
        flower: plant.flower || null,
        foliage: plant.foliage || null,
        fruitOrSeed: plant.fruit_or_seed || null,
        specifications: plant.specifications || null,
        growth: plant.growth || null,
        links: plant.links || null,
      }));

      // Apply pagination
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedPlants = plants.slice(startIndex, endIndex);

      res.json({
        plants: paginatedPlants,
        pagination: {
          total: plants.length,
          page: pageNum,
          limit: limitNum,
          links: {
            self: `/api/trefle/search?q=${encodeURIComponent(
              q as string
            )}&page=${pageNum}&limit=${limitNum}`,
            first: `/api/trefle/search?q=${encodeURIComponent(
              q as string
            )}&page=1&limit=${limitNum}`,
            last: `/api/trefle/search?q=${encodeURIComponent(
              q as string
            )}&page=${Math.ceil(plants.length / limitNum)}&limit=${limitNum}`,
            next:
              pageNum < Math.ceil(plants.length / limitNum)
                ? `/api/trefle/search?q=${encodeURIComponent(
                    q as string
                  )}&page=${pageNum + 1}&limit=${limitNum}`
                : undefined,
            prev:
              pageNum > 1
                ? `/api/trefle/search?q=${encodeURIComponent(
                    q as string
                  )}&page=${pageNum - 1}&limit=${limitNum}`
                : undefined,
          },
        },
      });
    } catch (apiError) {
      console.error("Error searching RapidAPI House Plants:", apiError);

      // Fallback to popular houseplants if API fails
      // Note: When RapidAPI subscription is active, this will use real plant photos from the API
      // For now, we use category-based images for visual consistency

      // Category-based image mapping
      // This function assigns appropriate images based on plant categories:
      // - Flowering plants: Peace Lily, Bird of Paradise, etc.
      // - Succulents/Cacti: Aloe, Jade, Cactus, String of Pearls, etc.
      // - Ficus family: Fiddle Leaf Fig, Rubber Plant, Weeping Fig, etc.
      // - Ferns: Boston Fern and similar delicate plants
      // - Spider plants: Chlorophytum and similar
      // - Snake plants: Sansevieria and similar
      // - Tropical foliage: Monstera, Philodendron, Pothos, Calathea, ZZ Plant, etc.
      const getCategoryImage = (
        plantName: string,
        family: string,
        genus: string
      ) => {
        const name = plantName.toLowerCase();
        const familyLower = family?.toLowerCase() || "";
        const genusLower = genus?.toLowerCase() || "";

        // Flowering plants (check first to override other categories)
        if (
          name.includes("lily") ||
          name.includes("orchid") ||
          name.includes("rose") ||
          name.includes("daisy") ||
          name.includes("bird of paradise") ||
          name.includes("peace lily") ||
          name.includes("flower")
        ) {
          return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"; // Flowering plants
        }

        // Succulents and cacti
        if (
          name.includes("cactus") ||
          name.includes("succulent") ||
          name.includes("aloe") ||
          name.includes("jade") ||
          name.includes("echeveria") ||
          name.includes("sedum") ||
          name.includes("string of pearls") ||
          name.includes("string of") ||
          familyLower.includes("cactaceae") ||
          familyLower.includes("crassulaceae")
        ) {
          return "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400"; // Succulent/cactus image
        }

        // Ficus family (trees and large plants)
        if (
          name.includes("ficus") ||
          name.includes("fig") ||
          name.includes("rubber plant") ||
          name.includes("weeping fig") ||
          familyLower.includes("moraceae") ||
          genusLower.includes("ficus")
        ) {
          return "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"; // Tree-like plants
        }

        // Ferns and delicate plants
        if (
          name.includes("fern") ||
          name.includes("moss") ||
          name.includes("boston fern") ||
          familyLower.includes("nephrolepidaceae")
        ) {
          return "https://images.unsplash.com/photo-1572688484438-313a6e50c50c?w=400"; // Ferns/delicate plants
        }

        // Spider plants and similar
        if (name.includes("spider plant") || name.includes("chlorophytum")) {
          return "https://images.unsplash.com/photo-1572688484438-313a6e50c50c?w=400"; // Spider plants
        }

        // Snake plants and similar
        if (name.includes("snake plant") || name.includes("sansevieria")) {
          return "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400"; // Snake plants
        }

        // Tropical foliage plants (Monstera, Philodendron, etc.) - check last
        if (
          name.includes("monstera") ||
          name.includes("philodendron") ||
          name.includes("pothos") ||
          name.includes("anthurium") ||
          name.includes("calathea") ||
          name.includes("zz plant") ||
          familyLower.includes("araceae") ||
          familyLower.includes("marantaceae")
        ) {
          return "https://images.unsplash.com/photo-1545239705-1564e58b1789?w=400"; // Tropical foliage
        }

        // Default for other plants
        return "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400";
      };

      const popularHouseplants = [
        // Ficus Family
        {
          id: "houseplant-1",
          name: "Fiddle Leaf Fig",
          scientificName: "Ficus lyrata",
          family: "Moraceae",
          genus: "Ficus",
          imageUrl: getCategoryImage("Fiddle Leaf Fig", "Moraceae", "Ficus"),
          year: 1890,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Tropical West Africa",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-5",
          name: "Rubber Plant",
          scientificName: "Ficus elastica",
          family: "Moraceae",
          genus: "Ficus",
          imageUrl: getCategoryImage("Rubber Plant", "Moraceae", "Ficus"),
          year: 1810,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Southeast Asia",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-11",
          name: "Weeping Fig",
          scientificName: "Ficus benjamina",
          family: "Moraceae",
          genus: "Ficus",
          imageUrl: getCategoryImage("Weeping Fig", "Moraceae", "Ficus"),
          year: 1767,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Southeast Asia",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        // Araceae Family
        {
          id: "houseplant-3",
          name: "Pothos",
          scientificName: "Epipremnum aureum",
          family: "Araceae",
          genus: "Epipremnum",
          imageUrl: getCategoryImage("Pothos", "Araceae", "Epipremnum"),
          year: 1880,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Southeast Asia",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-4",
          name: "Monstera Deliciosa",
          scientificName: "Monstera deliciosa",
          family: "Araceae",
          genus: "Monstera",
          imageUrl: getCategoryImage(
            "Monstera Deliciosa",
            "Araceae",
            "Monstera"
          ),
          year: 1849,
          edible: true,
          ediblePart: ["fruit"],
          edibleDescription: "The fruit is edible when fully ripe",
          distribution: "Central America",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-6",
          name: "Peace Lily",
          scientificName: "Spathiphyllum",
          family: "Araceae",
          genus: "Spathiphyllum",
          imageUrl: getCategoryImage("Peace Lily", "Araceae", "Spathiphyllum"),
          year: 1877,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Central and South America",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-7",
          name: "ZZ Plant",
          scientificName: "Zamioculcas zamiifolia",
          family: "Araceae",
          genus: "Zamioculcas",
          imageUrl: getCategoryImage("ZZ Plant", "Araceae", "Zamioculcas"),
          year: 1892,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "East Africa",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-8",
          name: "Chinese Evergreen",
          scientificName: "Aglaonema",
          family: "Araceae",
          genus: "Aglaonema",
          imageUrl: getCategoryImage(
            "Chinese Evergreen",
            "Araceae",
            "Aglaonema"
          ),
          year: 1829,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Southeast Asia",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-9",
          name: "Philodendron",
          scientificName: "Philodendron",
          family: "Araceae",
          genus: "Philodendron",
          imageUrl: getCategoryImage("Philodendron", "Araceae", "Philodendron"),
          year: 1830,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Central and South America",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        // Asparagaceae Family
        {
          id: "houseplant-2",
          name: "Snake Plant",
          scientificName: "Sansevieria trifasciata",
          family: "Asparagaceae",
          genus: "Sansevieria",
          imageUrl: getCategoryImage(
            "Snake Plant",
            "Asparagaceae",
            "Sansevieria"
          ),
          year: 1903,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "West Africa",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        // Asphodelaceae Family
        {
          id: "houseplant-10",
          name: "Aloe Vera",
          scientificName: "Aloe vera",
          family: "Asphodelaceae",
          genus: "Aloe",
          imageUrl: getCategoryImage("Aloe Vera", "Asphodelaceae", "Aloe"),
          year: 1753,
          edible: true,
          ediblePart: ["gel"],
          edibleDescription:
            "The gel is used in various products and can be consumed",
          distribution: "Arabian Peninsula",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        // Additional Popular Houseplants
        {
          id: "houseplant-12",
          name: "Spider Plant",
          scientificName: "Chlorophytum comosum",
          family: "Asparagaceae",
          genus: "Chlorophytum",
          imageUrl: getCategoryImage(
            "Spider Plant",
            "Asparagaceae",
            "Chlorophytum"
          ),
          year: 1794,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "South Africa",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-13",
          name: "Jade Plant",
          scientificName: "Crassula ovata",
          family: "Crassulaceae",
          genus: "Crassula",
          imageUrl: getCategoryImage("Jade Plant", "Crassulaceae", "Crassula"),
          year: 1910,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "South Africa",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-14",
          name: "String of Pearls",
          scientificName: "Senecio rowleyanus",
          family: "Asteraceae",
          genus: "Senecio",
          imageUrl: getCategoryImage(
            "String of Pearls",
            "Asteraceae",
            "Senecio"
          ),
          year: 1968,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Southwest Africa",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-15",
          name: "Boston Fern",
          scientificName: "Nephrolepis exaltata",
          family: "Nephrolepidaceae",
          genus: "Nephrolepis",
          imageUrl: getCategoryImage(
            "Boston Fern",
            "Nephrolepidaceae",
            "Nephrolepis"
          ),
          year: 1817,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Tropical regions worldwide",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-16",
          name: "Bird of Paradise",
          scientificName: "Strelitzia reginae",
          family: "Strelitziaceae",
          genus: "Strelitzia",
          imageUrl: getCategoryImage(
            "Bird of Paradise",
            "Strelitziaceae",
            "Strelitzia"
          ),
          year: 1788,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "South Africa",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-17",
          name: "Calathea",
          scientificName: "Calathea",
          family: "Marantaceae",
          genus: "Calathea",
          imageUrl: getCategoryImage("Calathea", "Marantaceae", "Calathea"),
          year: 1814,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Tropical Americas",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-18",
          name: "Dracaena",
          scientificName: "Dracaena",
          family: "Asparagaceae",
          genus: "Dracaena",
          imageUrl:
            "https://images.unsplash.com/photo-1572688484438-313a6e50c50c?w=400",
          year: 1767,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Africa, Asia, Central America",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-19",
          name: "Pilea",
          scientificName: "Pilea peperomioides",
          family: "Urticaceae",
          genus: "Pilea",
          imageUrl: getCategoryImage("Pilea", "Urticaceae", "Pilea"),
          year: 1912,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "China",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
        {
          id: "houseplant-20",
          name: "Cactus",
          scientificName: "Cactaceae",
          family: "Cactaceae",
          genus: "Various",
          imageUrl: getCategoryImage("Cactus", "Cactaceae", "Various"),
          year: 1753,
          edible: false,
          ediblePart: null,
          edibleDescription: null,
          distribution: "Americas",
          flower: null,
          foliage: null,
          fruitOrSeed: null,
          specifications: null,
          growth: null,
          links: null,
        },
      ];

      // Filter popular houseplants based on search query
      const searchTerm = (q as string).toLowerCase();
      const filteredPlants = popularHouseplants.filter((plant) => {
        const name = plant.name.toLowerCase();
        const scientificName = plant.scientificName.toLowerCase();
        const genus = plant.genus?.toLowerCase() || "";
        const family = plant.family?.toLowerCase() || "";

        return (
          name.includes(searchTerm) ||
          scientificName.includes(searchTerm) ||
          genus.includes(searchTerm) ||
          family.includes(searchTerm)
        );
      });

      // Apply pagination
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedPlants = filteredPlants.slice(startIndex, endIndex);

      res.json({
        plants: paginatedPlants,
        pagination: {
          total: filteredPlants.length,
          page: pageNum,
          limit: limitNum,
          links: {
            self: `/api/trefle/search?q=${encodeURIComponent(
              q as string
            )}&page=${pageNum}&limit=${limitNum}`,
            first: `/api/trefle/search?q=${encodeURIComponent(
              q as string
            )}&page=1&limit=${limitNum}`,
            last: `/api/trefle/search?q=${encodeURIComponent(
              q as string
            )}&page=${Math.ceil(
              filteredPlants.length / limitNum
            )}&limit=${limitNum}`,
            next:
              pageNum < Math.ceil(filteredPlants.length / limitNum)
                ? `/api/trefle/search?q=${encodeURIComponent(
                    q as string
                  )}&page=${pageNum + 1}&limit=${limitNum}`
                : undefined,
            prev:
              pageNum > 1
                ? `/api/trefle/search?q=${encodeURIComponent(
                    q as string
                  )}&page=${pageNum - 1}&limit=${limitNum}`
                : undefined,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error searching plants:", error);
    res.status(500).json({ error: "Failed to search plants" });
  }
});

// Get plant details by ID
router.get("/plant/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.TREFLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Trefle API key not configured" });
    }

    const response = await axios.get<TreflePlantDetail>(
      `https://trefle.io/api/v1/plants/${id}`,
      {
        params: {
          token: apiKey,
        },
      }
    );

    const plant = response.data.data;

    // Transform the response to match our app's format
    const plantDetail = {
      id: plant.id.toString(),
      name: plant.common_name || plant.scientific_name,
      scientificName: plant.scientific_name,
      family: plant.family,
      genus: plant.genus,
      imageUrl: plant.image_url,
      year: plant.year,
      edible: plant.edible,
      ediblePart: plant.edible_part,
      edibleDescription: plant.edible_description,
      distribution: plant.distribution,
      flower: plant.flower,
      foliage: plant.foliage,
      fruitOrSeed: plant.fruit_or_seed,
      specifications: plant.specifications,
      growth: plant.growth,
      links: plant.links,
    };

    res.json(plantDetail);
  } catch (error) {
    console.error("Error fetching plant details from Trefle API:", error);
    res.status(500).json({ error: "Failed to fetch plant details" });
  }
});

// Get care recommendations based on plant data
router.get("/care/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.TREFLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Trefle API key not configured" });
    }

    const response = await axios.get<TreflePlantDetail>(
      `https://trefle.io/api/v1/plants/${id}`,
      {
        params: {
          token: apiKey,
        },
      }
    );

    const plant = response.data.data;
    const growth = plant.growth;

    // Generate care recommendations based on plant data
    const recommendations = [];

    if (growth) {
      // Watering recommendations
      if (growth.minimum_precipitation?.mm) {
        const minPrecip = growth.minimum_precipitation.mm;
        if (minPrecip < 500) {
          recommendations.push({
            type: "warning",
            message:
              "This plant requires low water. Water sparingly and ensure good drainage.",
            icon: "💧",
          });
        } else if (minPrecip > 1000) {
          recommendations.push({
            type: "info",
            message: "This plant prefers high humidity and regular watering.",
            icon: "🌧️",
          });
        }
      }

      // Temperature recommendations
      if (
        growth.minimum_temperature?.deg_c &&
        growth.maximum_temperature?.deg_c
      ) {
        const minTemp = growth.minimum_temperature.deg_c;
        const maxTemp = growth.maximum_temperature.deg_c;

        if (minTemp < 10) {
          recommendations.push({
            type: "warning",
            message:
              "This plant is cold-sensitive. Keep indoors during winter.",
            icon: "❄️",
          });
        }

        if (maxTemp > 30) {
          recommendations.push({
            type: "info",
            message:
              "This plant tolerates high temperatures. Good for warm climates.",
            icon: "☀️",
          });
        }
      }

      // Light recommendations
      if (growth.light !== null) {
        if (growth.light < 3) {
          recommendations.push({
            type: "info",
            message:
              "This plant prefers low light conditions. Perfect for shady spots.",
            icon: "🌿",
          });
        } else if (growth.light > 7) {
          recommendations.push({
            type: "warning",
            message: "This plant needs bright, direct sunlight.",
            icon: "☀️",
          });
        }
      }

      // Soil recommendations
      if (growth.soil_humidity !== null) {
        if (growth.soil_humidity < 3) {
          recommendations.push({
            type: "info",
            message:
              "This plant prefers dry soil. Use well-draining potting mix.",
            icon: "🏜️",
          });
        } else if (growth.soil_humidity > 7) {
          recommendations.push({
            type: "info",
            message:
              "This plant prefers moist soil. Keep soil consistently damp.",
            icon: "💧",
          });
        }
      }
    }

    // Add general recommendations if no specific ones
    if (recommendations.length === 0) {
      recommendations.push({
        type: "info",
        message:
          "General care: Water when soil feels dry, provide bright indirect light.",
        icon: "🌱",
      });
    }

    res.json({
      plant: {
        id: plant.id.toString(),
        name: plant.common_name || plant.scientific_name,
        scientificName: plant.scientific_name,
        imageUrl: plant.image_url,
      },
      recommendations,
      growthData: growth,
    });
  } catch (error) {
    console.error("Error fetching care recommendations:", error);
    res.status(500).json({ error: "Failed to fetch care recommendations" });
  }
});

export default router;
