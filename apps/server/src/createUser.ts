import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('Creating user...');
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword', // In a real app, this should be hashed
      },
    });
    
    console.log('✅ User created:', user);
    
    // Create a room
    const room = await prisma.room.create({
      data: {
        name: 'Living Room',
        userId: user.id,
      },
    });
    
    console.log('✅ Room created:', room);
    
    // Create a plant
    const plant = await prisma.plant.create({
      data: {
        name: 'Monstera Deliciosa',
        species: 'Monstera deliciosa',
        waterFrequency: 7,
        lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextWaterDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        careNotes: 'Loves bright indirect light and high humidity',
        userId: user.id,
        roomId: room.id,
      },
    });
    
    console.log('✅ Plant created:', plant);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
