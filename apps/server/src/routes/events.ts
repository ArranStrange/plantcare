import express from "express";
import { prisma } from "../index";

const router = express.Router();

// Mark an event as completed
router.post("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.careEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const updatedEvent = await prisma.careEvent.update({
      where: { id },
      data: {
        completed: true,
      },
    });

    res.json({
      ...updatedEvent,
      date: updatedEvent.date.toISOString(),
    });
  } catch (error) {
    console.error("Error completing event:", error);
    res.status(500).json({ error: "Failed to complete event" });
  }
});

// Create a new care event
router.post("/", async (req, res) => {
  try {
    const { plantId, userId, type, date } = req.body;

    const event = await prisma.careEvent.create({
      data: {
        plantId,
        userId: userId || (await prisma.user.findFirst())?.id || "",
        type,
        date: new Date(date),
        completed: false,
      },
    });

    res.status(201).json({
      ...event,
      date: event.date.toISOString(),
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Get events for a plant
router.get("/plant/:plantId", async (req, res) => {
  try {
    const { plantId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const events = await prisma.careEvent.findMany({
      where: { plantId },
      orderBy: { date: "desc" },
      take: limit,
      include: {
        plant: {
          select: {
            name: true,
            species: true,
          },
        },
      },
    });

    res.json(
      events.map((event) => ({
        ...event,
        date: event.date.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching plant events:", error);
    res.status(500).json({ error: "Failed to fetch plant events" });
  }
});

// Get all events for a user
router.get("/", async (req, res) => {
  try {
    let userId = req.query.userId as string;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      userId = defaultUser?.id || "";
    }
    const completed = req.query.completed === "true";

    const events = await prisma.careEvent.findMany({
      where: {
        userId,
        completed,
      },
      orderBy: { date: "asc" },
      include: {
        plant: {
          select: {
            name: true,
            species: true,
          },
        },
      },
    });

    res.json(
      events.map((event) => ({
        ...event,
        date: event.date.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

export default router;
