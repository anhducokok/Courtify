import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
