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
  // completedDays: {
  //   select: {
  //     id: true,
  //     date: true,
  //   },
  // },
  creator: {
    select: {
      id: true,
    },
  },
});

export type TaskPreview = Prisma.TaskGetPayload<{ select: typeof taskPreview }>;

// Query
export default function fetchTasks(prisma: PrismaClient, creatorId: number) {
  return prisma.task.findMany({
    select: taskPreview,
    where: creatorHasId(creatorId),
  });
}
