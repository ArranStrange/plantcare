import express from "express";
import { prisma } from "../index";

const router = express.Router();

// Get all rooms for a user
router.get("/", async (req, res) => {
  try {
    let userId = req.query.userId as string;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      userId = defaultUser?.id || "";
    }

    const rooms = await prisma.room.findMany({
      where: { userId },
      include: {
        plants: {
          orderBy: { name: "asc" },
        },
        _count: {
          select: { plants: true },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(
      rooms.map((room) => ({
        id: room.id,
        name: room.name,
        userId: room.userId,
        plantCount: room._count.plants,
        plants: room.plants.map((plant) => ({
          ...plant,
          lastWatered: plant.lastWatered?.toISOString(),
          nextWaterDate: plant.nextWaterDate?.toISOString(),
        })),
      }))
    );
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Get room by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        plants: {
          orderBy: { name: "asc" },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      ...room,
      plants: room.plants.map((plant) => ({
        ...plant,
        lastWatered: plant.lastWatered?.toISOString(),
        nextWaterDate: plant.nextWaterDate?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// Create a new room
router.post("/", async (req, res) => {
  try {
    const { name, userId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const room = await prisma.room.create({
      data: {
        name,
        userId: userId || (await prisma.user.findFirst())?.id || "",
      },
    });

    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Update a room
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const room = await prisma.room.update({
      where: { id },
      data: { name },
    });

    res.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
});

// Delete a room
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room has plants
    const plantsCount = await prisma.plant.count({
      where: { roomId: id },
    });

    if (plantsCount > 0) {
      return res.status(400).json({
        error:
          "Cannot delete room with plants. Please move or delete plants first.",
      });
    }

    await prisma.room.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

export default router;
