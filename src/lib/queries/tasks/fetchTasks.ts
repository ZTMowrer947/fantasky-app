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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function fetchTasks(prisma: PrismaClient, creatorId: number) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  return prisma.task.findMany({
    select: taskPreview,
    where: creatorHasId(creatorId),
  });
}
