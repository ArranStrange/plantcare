import { PrismaClient } from "@prisma/client";
import { addDays } from "./utils/dateUtils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed data...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@plantcare.com" },
    update: {},
    create: {
      email: "demo@plantcare.com",
    },
  });

  console.log("👤 Created user:", user.email);

  // Create rooms
  const livingRoom = await prisma.room.create({
    data: {
      name: "Living Room",
      userId: user.id,
    },
  });

  const bedroom = await prisma.room.create({
    data: {
      name: "Bedroom",
      userId: user.id,
    },
  });

  const kitchen = await prisma.room.create({
    data: {
      name: "Kitchen",
      userId: user.id,
    },
  });

  console.log("🏠 Created rooms");

  // Create plants
  const now = new Date();

  const plants = [
    {
      name: "Fiddle Leaf Fig",
      species: "Ficus lyrata",
      photoUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      waterFrequency: 7,
      lastWatered: addDays(now, -5),
      careNotes:
        "Loves bright, indirect light. Water when top inch of soil is dry.",
      roomId: livingRoom.id,
    },
    {
      name: "Snake Plant",
      species: "Sansevieria trifasciata",
      photoUrl:
        "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400",
      waterFrequency: 14,
      lastWatered: addDays(now, -10),
      careNotes:
        "Very low maintenance. Can tolerate low light and infrequent watering.",
      roomId: bedroom.id,
    },
    {
      name: "Pothos",
      species: "Epipremnum aureum",
      photoUrl:
        "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=400",
      waterFrequency: 5,
      lastWatered: addDays(now, -3),
      careNotes:
        "Easy-going plant. Water when soil feels dry. Great for beginners.",
      roomId: kitchen.id,
    },
    {
      name: "Monstera Deliciosa",
      species: "Monstera deliciosa",
      photoUrl:
        "https://images.unsplash.com/photo-1545239705-1564e58b1789?w=400",
      waterFrequency: 7,
      lastWatered: addDays(now, -6),
      careNotes: "Likes bright, indirect light. Provide support for climbing.",
      roomId: livingRoom.id,
    },
    {
      name: "Rubber Plant",
      species: "Ficus elastica",
      photoUrl:
        "https://images.unsplash.com/photo-1542052459-4d6c7d3b97ac?w=400",
      waterFrequency: 10,
      lastWatered: addDays(now, -8),
      careNotes: "Glossy leaves that need regular cleaning. Water moderately.",
      roomId: bedroom.id,
    },
    {
      name: "Peace Lily",
      species: "Spathiphyllum",
      photoUrl:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      waterFrequency: 5,
      lastWatered: addDays(now, -2),
      careNotes:
        "Droops when thirsty - a great indicator plant! Loves humidity.",
      roomId: kitchen.id,
    },
  ];

  for (const plantData of plants) {
    const nextWaterDate = addDays(
      plantData.lastWatered,
      plantData.waterFrequency
    );

    const plant = await prisma.plant.create({
      data: {
        ...plantData,
        nextWaterDate,
        userId: user.id,
      },
    });

    // Create care events
    const events = [
      // Past watering events
      {
        plantId: plant.id,
        userId: user.id,
        type: "watering",
        date: addDays(plantData.lastWatered, -plantData.waterFrequency),
        completed: true,
      },
      {
        plantId: plant.id,
        userId: user.id,
        type: "watering",
        date: plantData.lastWatered,
        completed: true,
      },
      // Upcoming watering
      {
        plantId: plant.id,
        userId: user.id,
        type: "watering",
        date: nextWaterDate,
        completed: false,
      },
      // Some fertilizing events
      {
        plantId: plant.id,
        userId: user.id,
        type: "fertilising",
        date: addDays(now, Math.floor(Math.random() * 30) + 7),
        completed: false,
      },
    ];

    for (const eventData of events) {
      await prisma.careEvent.create({
        data: {
          ...eventData,
        },
      });
    }
  }

  console.log("🌿 Created plants and care events");
  console.log("✅ Seed data complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
