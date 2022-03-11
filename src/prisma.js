import { PrismaClient } from '@prisma/client';

/**
 * @type {PrismaClient}
 */
const prisma = (() => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient();
  }
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }

  return global.prisma;
})();

export default prisma;
