import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }

  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Starting seeding...');

  try {
    await prisma.tour.deleteMany();

    const tours = [
      {
        title: 'Dukan Lake Sunset Boat Tour',
        description: 'Experience the breathtaking sunset over Lake Dukan.',
        destination: 'Dukan, Sulaymaniyah, Iraq',
        latitude: 35.9525,
        longitude: 44.9603,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priceIQD: 25000,
        maxSeats: 12,
        availableSeats: 12,
        imageUrl:
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
      },
      {
        title: 'Erbil Citadel Historical Walk',
        description: 'A guided journey through Erbil Citadel.',
        destination: 'Erbil Citadel, Erbil, Iraq',
        latitude: 36.1901,
        longitude: 44.0093,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priceIQD: 15000,
        maxSeats: 30,
        availableSeats: 30,
        imageUrl: 'https://images.unsplash.com/photo-1549400851-24021200155b',
      },
      {
        title: 'Mesopotamian Marshes Canoe Adventure',
        description:
          'Navigate the historic Ahwar of Southern Iraq in a traditional Mashoof canoe. Experience the unique biodiversity and local Marsh Arab culture.',
        destination: 'Chibayish, Dhi Qar, Iraq',
        latitude: 31.0267,
        longitude: 47.0163,
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priceIQD: 35000,
        maxSeats: 8,
        availableSeats: 8,
        imageUrl: 'https://images.unsplash.com/photo-1545153996-039c36696d5b',
      },
      {
        title: 'Ancient Babylon Ruins Tour',
        description:
          'Step back in time at the site of the Hanging Gardens. A professional archeological guide will take you through the Ishtar Gate and the Processional Way.',
        destination: 'Hillah, Babil, Iraq',
        latitude: 32.5355,
        longitude: 44.4275,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priceIQD: 20000,
        maxSeats: 40,
        availableSeats: 40,
        imageUrl:
          'https://images.unsplash.com/photo-1590074259021-394582f33c70',
      },
      {
        title: 'Amadiya Citadel Mountain Hike',
        description:
          'Visit the mountaintop village of Amadiya. This tour features a rigorous hike with panoramic views of the Duhok valleys and historical gateways.',
        destination: 'Amadiya, Duhok, Iraq',
        latitude: 37.0911,
        longitude: 43.4868,
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        priceIQD: 30000,
        maxSeats: 15,
        availableSeats: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1516533075015-a3838414c3cb',
      },
      {
        title: 'Basra Shatt al-Arab Night Cruise',
        description:
          'Enjoy the "Venice of the East" with a moonlit boat trip along the Shatt al-Arab, passing by historic merchant houses (Shanasheel).',
        destination: 'Basra, Basra, Iraq',
        latitude: 30.5081,
        longitude: 47.7835,
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        priceIQD: 18000,
        maxSeats: 25,
        availableSeats: 25,
        imageUrl: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35',
      },
      {
        title: 'Mount Safin Peak Challenge',
        description:
          'A demanding day-climb to the summit of Mount Safin in Shaqlawa. Recommended for experienced hikers. Includes traditional Kurdish breakfast at the base.',
        destination: 'Shaqlawa, Erbil, Iraq',
        latitude: 36.4026,
        longitude: 44.3168,
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        priceIQD: 55000,
        maxSeats: 10,
        availableSeats: 10,
        imageUrl:
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
      },
      {
        title: 'Hatra Archeological Expedition',
        description:
          'Explore the UNESCO World Heritage site of Hatra. View the remarkably preserved Parthian architecture in the heart of the Nineveh desert.',
        destination: 'Al-Hadr, Nineveh, Iraq',
        latitude: 35.5866,
        longitude: 42.7169,
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        priceIQD: 40000,
        maxSeats: 20,
        availableSeats: 20,
        imageUrl:
          'https://images.unsplash.com/photo-1473163928189-39dc23c914d8',
      },
    ];

    for (const tourData of tours) {
      await prisma.tour.create({ data: tourData });
    }

    console.log('Seeding finished successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
