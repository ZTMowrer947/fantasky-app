import { Prisma, PrismaClient } from '@prisma/client';

import UpsertTaskDto from '@/dto/UpsertTaskDto';
import { serializeDaysToRepeat } from '@/lib/helpers/days';

// Mutation filtering
const taskHasId = (id: number | bigint) =>
  Prisma.validator<Prisma.TaskWhereInput>()({
    id,
  });

// Mutation selection
const taskIdOnly = Prisma.validator<Prisma.TaskSelect>()({
  id: true,
});

// Mutation input
const modifyTask = (taskData: UpsertTaskDto) =>
  Prisma.validator<Prisma.TaskUpdateInput>()({
    name: taskData.name,
    description: taskData.description,
    startDate: taskData.startDate,
    reminderTime: taskData.reminderTime,
    daysToRepeat: serializeDaysToRepeat(taskData.activeDays),
  });

// Mutation
export default function editTask(
  prisma: PrismaClient,
  taskId: number | bigint,
  taskData: UpsertTaskDto
) {
  return prisma.task.update({
    where: taskHasId(taskId),
    data: modifyTask(taskData),
    select: taskIdOnly,
  });
}
