import { Prisma, PrismaClient } from '@prisma/client';

// Query filtering
const creatorHasId = (id: number) =>
  Prisma.validator<Prisma.TaskWhereInput>()({
    creatorId: id,
  });

// Query selection
const taskPreview = Prisma.validator<Prisma.TaskSelect>()({
  id: true,
  name: true,
  daysToRepeat: true,
  tasksToDays: {
    select: {
      day: {
        select: {
          id: true,
          date: true,
        },
      },
    },
  },
  creator: {
    select: {
      id: true,
    },
  },
});

// Query
export default function fetchTasks(prisma: PrismaClient, creatorId: number) {
  return prisma.task.findMany({
    select: taskPreview,
    where: creatorHasId(creatorId),
  });
}
