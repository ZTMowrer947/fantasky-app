import { Prisma, PrismaClient } from '@prisma/client';

import UpsertTaskDto from '@/dto/UpsertTaskDto';
import { serializeDaysToRepeat } from '@/lib/helpers/days';

// Mutation selection
const taskIdOnly = Prisma.validator<Prisma.TaskSelect>()({
  id: true,
});

// Mutation input
const newTask = (userId: number | bigint, taskData: UpsertTaskDto) =>
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
    daysToRepeat: serializeDaysToRepeat(taskData.activeDays),
  });

// Mutation
export default function createTask(
  prisma: PrismaClient,
  userId: number | bigint,
  taskData: UpsertTaskDto
) {
  return prisma.task.create({
    data: newTask(userId, taskData),
    select: taskIdOnly,
  });
}
