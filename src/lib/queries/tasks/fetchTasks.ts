import { Prisma, PrismaClient } from '@prisma/client';

// Query filtering
const creatorHasId = (id: number) =>
  Prisma.validator<Prisma.NewTaskWhereInput>()({
    creatorId: id,
  });

// Query selection
const taskPreview = Prisma.validator<Prisma.NewTaskSelect>()({
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

// Query
export default function fetchTasks(prisma: PrismaClient, creatorId: number) {
  return prisma.newTask.findMany({
    select: taskPreview,
    where: creatorHasId(creatorId),
  });
}
