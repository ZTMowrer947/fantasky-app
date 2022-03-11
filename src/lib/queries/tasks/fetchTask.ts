import { Prisma, PrismaClient } from '@prisma/client';

// Query filtering
const creatorHasId = (id: number) =>
  Prisma.validator<Prisma.TaskWhereInput>()({
    creatorId: id,
  });

const taskHasId = (id: number) =>
  Prisma.validator<Prisma.TaskWhereInput>()({
    id,
  });

// Query selection
const detailedTask = Prisma.validator<Prisma.TaskSelect>()({
  id: true,
  name: true,
  description: true,
  startDate: true,
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

export type DetailedTask = Prisma.TaskGetPayload<{
  select: typeof detailedTask;
}>;

export default function fetchTask(
  prisma: PrismaClient,
  creatorId: number,
  taskId: number
) {
  return prisma.task.findFirst({
    select: detailedTask,
    where: {
      AND: [creatorHasId(creatorId), taskHasId(taskId)],
    },
  });
}
