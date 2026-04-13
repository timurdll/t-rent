import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Singleton Prisma Client для Next.js.
 *
 * В Next.js dev-режиме hot-reload создаёт новые модули, поэтому сохраняем
 * инстанс в globalThis чтобы переиспользовать его между перезагрузками.
 */

function createPrismaClient() {
  const connectionString = `${process.env.DATABASE_URL}`;

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

type GlobalPrisma = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma?: GlobalPrisma;
};

export const prisma: GlobalPrisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
