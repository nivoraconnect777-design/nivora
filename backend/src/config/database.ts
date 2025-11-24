import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL;

  // Auto-fix for Supabase Pooler URL: Add pgbouncer param only
  if (url && url.includes('pooler.supabase.com')) {
    // REVERTED: Do NOT switch port - keep original port 5432 to preserve data access
    // Switching to port 6543 may have caused data to appear missing

    // Ensure pgbouncer param is present for pooler compatibility
    if (!url.includes('pgbouncer=true')) {
      url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
      console.log('Automatically appended ?pgbouncer=true');
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: url ? {
      db: {
        url: url,
      },
    } : undefined,
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
