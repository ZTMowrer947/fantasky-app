import { Prisma, PrismaClient } from '@prisma/client';

// Query filtering
const creatorHasId = (id: number | bigint) =>
  Prisma.validator<Prisma.NewTaskWhereInput>()({
    creatorId: id,
  });

const taskHasId = (id: number | bigint) =>
  Prisma.validator<Prisma.NewTaskWhereInput>()({
    id,
  });

// Query selection
const detailedTask = Prisma.validator<Prisma.NewTaskSelect>()({
  id: true,
  name: true,
  description: true,
  startDate: true,
  activeDays: {
    select: {
      sunday: true,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
    },
  },
  completedDays: {
    select: {
      id: true,
      date: true,
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
  creatorId: number | bigint,
  taskId: number | bigint
) {
  return prisma.newTask.findFirst({
    select: detailedTask,
    where: {
      AND: [creatorHasId(creatorId), taskHasId(taskId)],
    },
  });
}
