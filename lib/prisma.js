import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = globalThis;

let prisma;

if (!globalForPrisma.prisma) {
  // Ensure we use the absolute path to dev.db so it works reliably in Next.js
  const dbPath = path.join(process.cwd(), 'dev.db');
  
  // Pass the config object with 'url' instead of a Database instance
  const adapter = new PrismaBetterSqlite3({
    url: `file:${dbPath}`
  });
  
  prisma = new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} else {
  prisma = globalForPrisma.prisma;
}

export { prisma };
