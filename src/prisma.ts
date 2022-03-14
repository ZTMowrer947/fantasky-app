import { PrismaClient } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const prisma: PrismaClient = (() => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient();
  }
  if (!(global as GlobalWithPrisma).prisma) {
    (global as GlobalWithPrisma).prisma = new PrismaClient();
  }

  return (global as GlobalWithPrisma).prisma!;
})();

export default prisma;
