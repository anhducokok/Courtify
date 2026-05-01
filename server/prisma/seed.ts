import 'dotenv/config';
import { PrismaClient, FieldFeature } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Time slots ─────────────────────────────────────────────
  const REF = '2000-01-01';
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

  // ── Courts + Fields ────────────────────────────────────────
  const courts = [
    {
      id: 'court-smash-center',
      name: 'Sân Cầu Lông Smash Center',
      location: 'Quận 1, TP. Hồ Chí Minh',
      latitude: 10.7769,
      longitude: 106.7009,
      averageRating: 4.8,
      reviewCount: 134,
      fields: [
        { name: 'Sân 1', price: 85000, features: [FieldFeature.LED] },
        {
          name: 'Sân 2',
          price: 90000,
          features: [FieldFeature.LED, FieldFeature.VIP],
        },
        { name: 'Sân 3', price: 80000, features: [] },
      ],
    },
    {
      id: 'court-pro-hub',
      name: 'Badminton Pro Hub',
      location: 'Quận Bình Thạnh, TP. HCM',
      latitude: 10.803,
      longitude: 106.7143,
      averageRating: 4.6,
      reviewCount: 98,
      fields: [
        { name: 'Sân 1', price: 120000, features: [FieldFeature.VIP] },
        { name: 'Sân 2', price: 110000, features: [FieldFeature.LED] },
      ],
    },
  ];

  console.log('Seeding courts & fields…');

  for (const court of courts) {
    // create/update court
    const createdCourt = await prisma.court.upsert({
      where: { id: court.id },
      update: {
        name: court.name,
        location: court.location,
        latitude: court.latitude,
        longitude: court.longitude,
        averageRating: court.averageRating,
        reviewCount: court.reviewCount,
      },
      create: {
        id: court.id,
        name: court.name,
        location: court.location,
        latitude: court.latitude,
        longitude: court.longitude,
        averageRating: court.averageRating,
        reviewCount: court.reviewCount,
      },
    });

    // create fields
    for (const f of court.fields) {
      await prisma.field.upsert({
        where: {
          id: `${court.id}-${f.name}`,
        },
        update: {},
        create: {
          id: `${court.id}-${f.name}`,
          name: f.name,
          pricePerHour: f.price,
          features: f.features,
          courtId: createdCourt.id,
        },
      });
    }
  }

  console.log('✅ Done seeding!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
