import express from "express";
import { prisma } from "../index";
import { addDays } from "../utils/dateUtils";

// Define types locally to avoid dependency issues
interface Plant {
  id: string;
  name: string;
  species: string;
  photoUrl?: string;
  waterFrequency: number;
  lastWatered?: string;
  nextWaterDate?: string;
  careNotes?: string | null;
  roomId?: string | null;
  userId: string;
}

interface Room {
  id: string;
  name: string;
  userId: string;
}

interface PlantWithRoom extends Plant {
  room?: Room;
}

const router = express.Router();

// Get all plants for a user (with room info)
router.get("/", async (req, res) => {
  try {
    // For demo purposes, using a default user ID - we'll get the first user
    let userId = req.query.userId as string;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        // If no users exist, return empty array instead of error
        return res.json([]);
      }
      userId = defaultUser.id;
    }

    const sortBy = (req.query.sortBy as string) || "name";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "asc";

    let orderBy: any = { name: "asc" };

    if (sortBy === "watering") {
      // Sort by watering priority: overdue first, then due today, then by next water date
      const plants = await prisma.plant.findMany({
        where: { userId },
        include: {
          room: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sortedPlants = plants.sort((a, b) => {
        // Plants without next water date go last
        if (!a.nextWaterDate && !b.nextWaterDate)
          return a.name.localeCompare(b.name);
        if (!a.nextWaterDate) return 1;
        if (!b.nextWaterDate) return -1;

        const aDate = new Date(a.nextWaterDate);
        const bDate = new Date(b.nextWaterDate);

        // Overdue plants (before today) come first
        const aOverdue = aDate < today;
        const bOverdue = bDate < today;

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // If both overdue, sort by how overdue they are (most overdue first)
        if (aOverdue && bOverdue) {
          return aDate.getTime() - bDate.getTime();
        }

        // Due today plants come next
        const aDueToday = aDate >= today && aDate < tomorrow;
        const bDueToday = bDate >= today && bDate < tomorrow;

        if (aDueToday && !bDueToday) return -1;
        if (!aDueToday && bDueToday) return 1;

        // Then sort by next water date (earliest first)
        return aDate.getTime() - bDate.getTime();
      });

      const plantsWithRoom: PlantWithRoom[] = sortedPlants.map((plant) => ({
        id: plant.id,
        name: plant.name,
        species: plant.species,
        photoUrl: plant.photoUrl || undefined,
        waterFrequency: plant.waterFrequency,
        lastWatered: plant.lastWatered?.toISOString(),
        nextWaterDate: plant.nextWaterDate?.toISOString(),
        careNotes: plant.careNotes,
        roomId: plant.roomId,
        userId: plant.userId,
        room: plant.room
          ? {
              id: plant.room.id,
              name: plant.room.name,
              userId: plant.room.userId,
            }
          : undefined,
      }));

      return res.json(plantsWithRoom);
    } else {
      // Default sorting by name or other fields
      orderBy = { [sortBy]: sortOrder };

      const plants = await prisma.plant.findMany({
        where: { userId },
        include: {
          room: true,
        },
        orderBy,
      });

      const plantsWithRoom: PlantWithRoom[] = plants.map((plant) => ({
        id: plant.id,
        name: plant.name,
        species: plant.species,
        photoUrl: plant.photoUrl || undefined,
        waterFrequency: plant.waterFrequency,
        lastWatered: plant.lastWatered?.toISOString(),
        nextWaterDate: plant.nextWaterDate?.toISOString(),
        careNotes: plant.careNotes,
        roomId: plant.roomId,
        userId: plant.userId,
        room: plant.room
          ? {
              id: plant.room.id,
              name: plant.room.name,
              userId: plant.room.userId,
            }
          : undefined,
      }));

      res.json(plantsWithRoom);
    }
  } catch (error) {
    console.error("Error fetching plants:", error);
    res.status(500).json({ error: "Failed to fetch plants" });
  }
});

// Get plants sorted by watering priority (convenience endpoint)
router.get("/sorted/watering", async (req, res) => {
  try {
    let userId = req.query.userId as string;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        // If no users exist, return empty array instead of error
        return res.json([]);
      }
      userId = defaultUser.id;
    }

    const plants = await prisma.plant.findMany({
      where: { userId },
      include: {
        room: true,
      },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sortedPlants = plants.sort((a, b) => {
      // Plants without next water date go last
      if (!a.nextWaterDate && !b.nextWaterDate)
        return a.name.localeCompare(b.name);
      if (!a.nextWaterDate) return 1;
      if (!b.nextWaterDate) return -1;

      const aDate = new Date(a.nextWaterDate);
      const bDate = new Date(b.nextWaterDate);

      // Overdue plants (before today) come first
      const aOverdue = aDate < today;
      const bOverdue = bDate < today;

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // If both overdue, sort by how overdue they are (most overdue first)
      if (aOverdue && bOverdue) {
        return aDate.getTime() - bDate.getTime();
      }

      // Due today plants come next
      const aDueToday = aDate >= today && aDate < tomorrow;
      const bDueToday = bDate >= today && bDate < tomorrow;

      if (aDueToday && !bDueToday) return -1;
      if (!aDueToday && bDueToday) return 1;

      // Then sort by next water date (earliest first)
      return aDate.getTime() - bDate.getTime();
    });

    const plantsWithRoom: PlantWithRoom[] = sortedPlants.map((plant) => ({
      id: plant.id,
      name: plant.name,
      species: plant.species,
      photoUrl: plant.photoUrl || undefined,
      waterFrequency: plant.waterFrequency,
      lastWatered: plant.lastWatered?.toISOString(),
      nextWaterDate: plant.nextWaterDate?.toISOString(),
      careNotes: plant.careNotes,
      roomId: plant.roomId,
      userId: plant.userId,
      room: plant.room
        ? {
            id: plant.room.id,
            name: plant.room.name,
            userId: plant.room.userId,
          }
        : undefined,
    }));

    res.json(plantsWithRoom);
  } catch (error) {
    console.error("Error fetching plants sorted by watering:", error);
    res.status(500).json({ error: "Failed to fetch plants" });
  }
});

// Get plant by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const plant = await prisma.plant.findUnique({
      where: { id },
      include: {
        room: true,
        events: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json({
      ...plant,
      lastWatered: plant.lastWatered?.toISOString(),
      nextWaterDate: plant.nextWaterDate?.toISOString(),
      events: plant.events.map((event) => ({
        ...event,
        date: event.date.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching plant:", error);
    res.status(500).json({ error: "Failed to fetch plant" });
  }
});

// Create a new plant
router.post("/", async (req, res) => {
  try {
    const {
      name,
      species,
      photoUrl,
      waterFrequency,
      careNotes,
      roomId,
      userId,
    } = req.body;

    // For demo purposes, using a default user ID if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const defaultUser = await prisma.user.findFirst();
      finalUserId = defaultUser?.id || "";
    }

    const now = new Date();
    const nextWaterDate = addDays(now, waterFrequency);

    const plant = await prisma.plant.create({
      data: {
        name,
        species,
        photoUrl,
        waterFrequency,
        careNotes,
        roomId: roomId || null,
        userId: finalUserId,
        nextWaterDate,
      },
    });

    // Create initial watering event
    await prisma.careEvent.create({
      data: {
        plantId: plant.id,
        userId: finalUserId,
        type: "watering",
        date: nextWaterDate,
        completed: false,
      },
    });

    res.status(201).json({
      ...plant,
      nextWaterDate: plant.nextWaterDate?.toISOString(),
    });
  } catch (error) {
    console.error("Error creating plant:", error);
    res.status(500).json({ error: "Failed to create plant" });
  }
});

// Update a plant
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, species, photoUrl, waterFrequency, careNotes, roomId } =
      req.body;

    const plant = await prisma.plant.update({
      where: { id },
      data: {
        name,
        species,
        photoUrl,
        waterFrequency,
        careNotes,
        roomId: roomId || null,
      },
    });

    res.json({
      ...plant,
      lastWatered: plant.lastWatered?.toISOString(),
      nextWaterDate: plant.nextWaterDate?.toISOString(),
    });
  } catch (error) {
    console.error("Error updating plant:", error);
    res.status(500).json({ error: "Failed to update plant" });
  }
});

// Mark plant as watered
router.post("/:id/water", async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const plant = await prisma.plant.findUnique({
      where: { id },
    });

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    const nextWaterDate = addDays(now, plant.waterFrequency);

    // Update plant
    const updatedPlant = await prisma.plant.update({
      where: { id },
      data: {
        lastWatered: now,
        nextWaterDate,
      },
    });

    // Mark current watering events as completed
    await prisma.careEvent.updateMany({
      where: {
        plantId: id,
        type: "watering",
        completed: false,
        date: {
          lte: now,
        },
      },
      data: {
        completed: true,
      },
    });

    // Create next watering event
    await prisma.careEvent.create({
      data: {
        plantId: id,
        userId: plant.userId,
        type: "watering",
        date: nextWaterDate,
        completed: false,
      },
    });

    res.json({
      ...updatedPlant,
      lastWatered: updatedPlant.lastWatered?.toISOString(),
      nextWaterDate: updatedPlant.nextWaterDate?.toISOString(),
    });
  } catch (error) {
    console.error("Error watering plant:", error);
    res.status(500).json({ error: "Failed to water plant" });
  }
});

// Get smart watering tip for a plant
router.get("/:id/tips", async (req, res) => {
  try {
    const { id } = req.params;

    const plant = await prisma.plant.findUnique({
      where: { id },
    });

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    // Mock weather-based tip (in real app, would integrate with weather API)
    const tips = [
      {
        condition: "high_humidity",
        message: `☁️ High humidity today — consider skipping watering for ${plant.name}`,
      },
      {
        condition: "rainy",
        message: `🌧️ It's been rainy — your ${plant.name} might need less water`,
      },
      {
        condition: "dry",
        message: `☀️ Dry weather — your ${plant.name} might need extra attention`,
      },
      {
        condition: "normal",
        message: `🌱 Perfect weather for ${plant.name} — water as scheduled`,
      },
    ];

    // Return a random tip for demo
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    res.json({
      plantId: id,
      plantName: plant.name,
      tip: randomTip.message,
      condition: randomTip.condition,
    });
  } catch (error) {
    console.error("Error getting plant tip:", error);
    res.status(500).json({ error: "Failed to get plant tip" });
  }
});

// Delete a plant
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.plant.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting plant:", error);
    res.status(500).json({ error: "Failed to delete plant" });
  }
});

export default router;
