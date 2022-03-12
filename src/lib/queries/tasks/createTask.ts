import { Prisma, PrismaClient } from '@prisma/client';

import UpsertTaskDto from '@/dto/UpsertTaskDto';

// Mutation selection
const taskIdOnly = Prisma.validator<Prisma.NewTaskSelect>()({
  id: true,
});

// Mutation input
const newTask = (userId: number | bigint, taskData: UpsertTaskDto) =>
  Prisma.validator<Prisma.NewTaskCreateInput>()({
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
        sunday: taskData.activeDays.sun,
        monday: taskData.activeDays.mon,
        tuesday: taskData.activeDays.tue,
        wednesday: taskData.activeDays.wed,
        thursday: taskData.activeDays.thu,
        friday: taskData.activeDays.fri,
        saturday: taskData.activeDays.sat,
      },
    },
  });

// Mutation
export default function createTask(
  prisma: PrismaClient,
  userId: number | bigint,
  taskData: UpsertTaskDto
) {
  return prisma.newTask.create({
    data: newTask(userId, taskData),
    select: taskIdOnly,
  });
}
