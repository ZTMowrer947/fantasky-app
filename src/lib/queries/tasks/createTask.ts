import { Prisma, PrismaClient } from '@prisma/client';

// Mutation types
const taskCreateViewModel = Prisma.validator<Prisma.TaskArgs>()({
  select: {
    name: true,
    description: true,
    startDate: true,
    reminderTime: true,
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
  },
});

export type TaskCreateViewModel = Prisma.TaskGetPayload<
  typeof taskCreateViewModel
>;

// Mutation selection
const taskIdOnly = Prisma.validator<Prisma.TaskSelect>()({
  id: true,
});

// Mutation input
const newTask = (userId: number | bigint, taskData: TaskCreateViewModel) =>
  Prisma.validator<Prisma.TaskCreateInput>()({
    creator: {
      connect: {
        id: userId,
      },
    },
    name: taskData.name,
    description: taskData.description,
    startDate: taskData.startDate,
    reminderTime: taskData.reminderTime,
    activeDays: {
      create: {
        ...taskData.activeDays,
      },
    },
  });

// Mutation
export default function createTask(
  prisma: PrismaClient,
  userId: number | bigint,
  taskData: TaskCreateViewModel
) {
  return prisma.task.create({
    data: newTask(userId, taskData),
    select: taskIdOnly,
  });
}
