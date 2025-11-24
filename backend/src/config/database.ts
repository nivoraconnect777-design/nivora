import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL;

  // Auto-fix for Supabase Pooler: Use Transaction Mode (Port 6543) for serverless
  if (url && url.includes('pooler.supabase.com')) {
    // Switch to port 6543 (Transaction Mode) - better for Vercel
    if (url.includes(':5432')) {
      url = url.replace(':5432', ':6543');
      console.log('✅ Switched to Port 6543 (Transaction Mode for serverless)');
    }

    // Ensure pgbouncer param is present
    if (!url.includes('pgbouncer=true')) {
      url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
      console.log('✅ Added ?pgbouncer=true');
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
