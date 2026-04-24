import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Time slots (generic daily schedule) ────────────────────────────────────
  const REF = '2000-01-01'; // reference date — only the time portion matters
  const slots = [
    { start: '06:00', end: '07:30' },
    { start: '07:30', end: '09:00' },
    { start: '09:00', end: '10:30' },
    { start: '10:30', end: '12:00' },
    { start: '13:00', end: '14:30' },
    { start: '14:30', end: '16:00' },
    { start: '16:00', end: '17:30' },
    { start: '17:30', end: '19:00' },
    { start: '19:00', end: '20:30' },
    { start: '20:30', end: '22:00' },
  ];

  console.log('Seeding time slots…');
  for (const s of slots) {
    await prisma.timeSlot.upsert({
      where: {
        id: `slot-${s.start}`,
      },
      update: {},
      create: {
        id: `slot-${s.start}`,
        startTime: new Date(`${REF}T${s.start}:00.000Z`),
        endTime: new Date(`${REF}T${s.end}:00.000Z`),
      },
    });
  }

  // ── Courts ─────────────────────────────────────────────────────────────────
  const courts = [
    {
      id: 'court-smash-center',
      name: 'Sân Cầu Lông Smash Center',
      location: 'Quận 1, TP. Hồ Chí Minh',
      pricePerHour: 85000,
      hasLED: false,
      surfaceType: 'vinyl',
      averageRating: 4.8,
      reviewCount: 134,
      latitude: 10.7769,
      longitude: 106.7009,
    },
    {
      id: 'court-pro-hub',
      name: 'Badminton Pro Hub',
      location: 'Quận Bình Thạnh, TP. HCM',
      pricePerHour: 120000,
      hasLED: true,
      surfaceType: 'rubber',
      averageRating: 4.6,
      reviewCount: 98,
      latitude: 10.8030,
      longitude: 106.7143,
    },
    {
      id: 'court-green-arena',
      name: 'Green Court Arena',
      location: 'Quận 7, TP. HCM',
      pricePerHour: 75000,
      hasLED: true,
      surfaceType: 'vinyl',
      averageRating: 4.3,
      reviewCount: 76,
      latitude: 10.7317,
      longitude: 106.7218,
    },
    {
      id: 'court-saigonbad',
      name: 'SaigonBad Club',
      location: 'Quận Thủ Đức, TP. HCM',
      pricePerHour: 95000,
      hasLED: true,
      surfaceType: 'wood',
      averageRating: 4.5,
      reviewCount: 210,
      latitude: 10.8505,
      longitude: 106.7717,
    },
    {
      id: 'court-sunrise',
      name: 'Sunrise Badminton Center',
      location: 'Quận 3, TP. HCM',
      pricePerHour: 90000,
      hasLED: true,
      surfaceType: 'rubber',
      averageRating: 4.7,
      reviewCount: 155,
      latitude: 10.7880,
      longitude: 106.6882,
    },
    {
      id: 'court-diamond',
      name: 'Diamond Court',
      location: 'Quận 10, TP. HCM',
      pricePerHour: 65000,
      hasLED: false,
      surfaceType: 'concrete',
      averageRating: 4.1,
      reviewCount: 42,
      latitude: 10.7740,
      longitude: 106.6680,
    },
    {
      id: 'court-golden-shuttle',
      name: 'Golden Shuttle Arena',
      location: 'Quận Gò Vấp, TP. HCM',
      pricePerHour: 80000,
      hasLED: true,
      surfaceType: 'vinyl',
      averageRating: 4.4,
      reviewCount: 89,
      latitude: 10.8384,
      longitude: 106.6740,
    },
    {
      id: 'court-champions',
      name: 'Champions Badminton Club',
      location: 'Quận 12, TP. HCM',
      pricePerHour: 110000,
      hasLED: true,
      surfaceType: 'wood',
      averageRating: 4.9,
      reviewCount: 312,
      latitude: 10.8630,
      longitude: 106.6570,
    },
  ];

  console.log('Seeding courts…');
  for (const court of courts) {
    await prisma.court.upsert({
      where: { id: court.id },
      update: court,
      create: court,
    });
  }

  console.log(`✅ Seeded ${slots.length} time slots and ${courts.length} courts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
