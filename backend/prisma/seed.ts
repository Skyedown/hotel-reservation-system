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

  // Create sample rooms
  const rooms = [
    {
      roomNumber: '101',
      type: 'STANDARD' as const,
      description: 'Comfortable standard room with city view',
      price: 89.00,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
    },
    {
      roomNumber: '102',
      type: 'DELUXE' as const,
      description: 'Spacious deluxe room with premium amenities',
      price: 129.00,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony'],
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
    },
    {
      roomNumber: '201',
      type: 'SUITE' as const,
      description: 'Luxury suite with separate living area',
      price: 199.00,
      capacity: 4,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony', 'Kitchen', 'Living Area'],
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    },
    {
      roomNumber: '202',
      type: 'PRESIDENTIAL' as const,
      description: 'Presidential suite with panoramic views and luxury amenities',
      price: 399.00,
      capacity: 6,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony', 'Kitchen', 'Living Area', 'Jacuzzi', 'Butler Service'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
    },
  ];

  for (const roomData of rooms) {
    const room = await prisma.room.upsert({
      where: { roomNumber: roomData.roomNumber },
      update: {},
      create: roomData,
    });
    console.log('Created room:', room.roomNumber);
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