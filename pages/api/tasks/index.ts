import { PrismaClient } from '@prisma/client';
import { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const getTasks: NextApiHandler = async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    // TODO:ztm Replace placeholder error with more robust authorization error
    res.status(401).json({
      message: 'Unauthorized',
    });
  } else {
    const prisma = new PrismaClient();

    try {
      const tasks = await prisma.user
        .findFirst({
          where: {
            OR: [
              {
                email: session.user.email,
              },
              {
                name: session.user.name,
              },
            ],
          },
        })
        .createdTasks();

      res.json(tasks);
    } finally {
      await prisma.$disconnect();
    }
  }
};

export default getTasks;
