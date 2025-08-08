import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword', // In a real app, this should be hashed
      },
    });
  } catch (error) {
    // User might already exist, try to find it
    user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    if (!user) {
      throw error;
    }
  }

  console.log('✅ Created user:', user.email);

  // Create a test room
  let room;
  try {
    room = await prisma.room.create({
      data: {
        name: 'Living Room',
        userId: user.id,
      },
    });
  } catch (error) {
    // Room might already exist, try to find it
    room = await prisma.room.findFirst({
      where: { 
        name: 'Living Room',
        userId: user.id,
      },
    });
    if (!room) {
      throw error;
    }
  }

  console.log('✅ Created room:', room.name);

  // Create some test plants
  const plantData = [
    {
      name: 'Monstera Deliciosa',
      species: 'Monstera deliciosa',
      waterFrequency: 7,
      lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      nextWaterDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      careNotes: 'Loves bright indirect light and high humidity',
    },
    {
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      waterFrequency: 14,
      lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      nextWaterDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (overdue)
      careNotes: 'Very low maintenance, tolerates low light',
    },
    {
      name: 'Pothos',
      species: 'Epipremnum aureum',
      waterFrequency: 5,
      lastWatered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      nextWaterDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      careNotes: 'Great trailing plant, easy to propagate',
    },
  ];

  const plants = [];
  for (const data of plantData) {
    try {
      const plant = await prisma.plant.create({
        data: {
          ...data,
          userId: user.id,
          roomId: room.id,
        },
      });
      plants.push(plant);
    } catch (error) {
      // Plant might already exist, skip
      console.log(`⚠️ Plant ${data.name} might already exist, skipping...`);
    }
  }

  console.log('✅ Created plants:', plants.map(p => p.name));

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
