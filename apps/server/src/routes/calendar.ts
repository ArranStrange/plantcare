import express from "express";
import { prisma } from "../index";

// Define types locally to avoid dependency issues
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  plantId: string;
  plantName: string;
  type: "watering" | "fertilising" | "repotting";
  completed: boolean;
}

const router = express.Router();

// Get calendar events for a date range
router.get("/", async (req, res) => {
  try {
    const { start, end } = req.query;
    let userId = req.query.userId as string;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        // If no users exist, return empty array instead of error
        return res.json([]);
      }
      userId = defaultUser.id;
    }

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    // Get care events in the date range
    const events = await prisma.careEvent.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        plant: {
          select: {
            name: true,
            species: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Transform to calendar format
    const calendarEvents: CalendarEvent[] = events.map((event) => {
      const eventDate = new Date(event.date);
      const endEventDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      return {
        id: event.id,
        title: `${getEventIcon(event.type)} ${event.plant.name}`,
        start: eventDate,
        end: endEventDate,
        plantId: event.plantId,
        plantName: event.plant.name,
        type: event.type as "watering" | "fertilising" | "repotting",
        completed: event.completed,
      };
    });

    res.json(calendarEvents);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});

// Get events for a specific date
router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    let userId = req.query.userId as string;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        // If no users exist, return empty array instead of error
        return res.json([]);
      }
      userId = defaultUser.id;
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      23,
      59,
      59
    );

    const events = await prisma.careEvent.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        plant: {
          select: {
            name: true,
            species: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(
      events.map((event) => ({
        ...event,
        date: event.date.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching daily events:", error);
    res.status(500).json({ error: "Failed to fetch daily events" });
  }
});

// Get upcoming events (next 7 days)
router.get("/upcoming", async (req, res) => {
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
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await prisma.careEvent.findMany({
      where: {
        userId,
        completed: false,
        date: {
          gte: now,
          lte: nextWeek,
        },
      },
      include: {
        plant: {
          select: {
            name: true,
            species: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(
      events.map((event) => ({
        ...event,
        date: event.date.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
});

function getEventIcon(type: string): string {
  switch (type) {
    case "watering":
      return "💧";
    case "fertilising":
      return "🌿";
    case "repotting":
      return "🪴";
    default:
      return "🌱";
  }
}

export default router;
