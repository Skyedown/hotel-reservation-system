import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@hotel.com' },
    update: {},
    create: {
      email: 'admin@hotel.com',
      firstName: 'Hotel',
      lastName: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create room types
  const roomTypes = [
    {
      name: 'Standard Room',
      description: 'Comfortable standard room with city view',
      price: 89.00,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
    },
    {
      name: 'Deluxe Room',
      description: 'Spacious deluxe room with premium amenities',
      price: 129.00,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony'],
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
    },
    {
      name: 'Suite',
      description: 'Luxury suite with separate living area',
      price: 199.00,
      capacity: 4,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony', 'Kitchen', 'Living Area'],
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    },
    {
      name: 'Presidential Suite',
      description: 'Presidential suite with panoramic views and luxury amenities',
      price: 399.00,
      capacity: 6,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony', 'Kitchen', 'Living Area', 'Jacuzzi', 'Butler Service'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
    },
  ];

  const createdRoomTypes = [];
  for (const roomTypeData of roomTypes) {
    const roomType = await prisma.roomType.upsert({
      where: { name: roomTypeData.name },
      update: {},
      create: roomTypeData,
    });
    createdRoomTypes.push(roomType);
    console.log('Created room type:', roomType.name);
  }

  // Create actual rooms for each room type
  const actualRoomsData = [
    // Standard Room - 4 rooms
    { roomNumber: '101', roomTypeName: 'Standard Room' },
    { roomNumber: '102', roomTypeName: 'Standard Room' },
    { roomNumber: '103', roomTypeName: 'Standard Room' },
    { roomNumber: '104', roomTypeName: 'Standard Room' },
    
    // Deluxe Room - 3 rooms
    { roomNumber: '201', roomTypeName: 'Deluxe Room' },
    { roomNumber: '202', roomTypeName: 'Deluxe Room' },
    { roomNumber: '203', roomTypeName: 'Deluxe Room' },
    
    // Suite - 2 rooms
    { roomNumber: '301', roomTypeName: 'Suite' },
    { roomNumber: '302', roomTypeName: 'Suite' },
    
    // Presidential Suite - 1 room
    { roomNumber: '401', roomTypeName: 'Presidential Suite' },
  ];

  for (const actualRoomData of actualRoomsData) {
    const roomType = createdRoomTypes.find(rt => rt.name === actualRoomData.roomTypeName);
    if (roomType) {
      const actualRoom = await prisma.actualRoom.upsert({
        where: { roomNumber: actualRoomData.roomNumber },
        update: {},
        create: {
          roomNumber: actualRoomData.roomNumber,
          roomTypeId: roomType.id,
          isAvailable: true,
          isUnderMaintenance: false,
        },
      });
      console.log('Created actual room:', actualRoom.roomNumber, 'for', roomType.name);
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });