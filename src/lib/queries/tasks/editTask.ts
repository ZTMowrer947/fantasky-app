import { Prisma, PrismaClient } from '@prisma/client';

import { TaskCreateViewModel as TaskUpdateViewModel } from './createTask';

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
const modifyTask = (taskData: TaskUpdateViewModel) =>
  Prisma.validator<Prisma.TaskUpdateInput>()({
    name: taskData.name,
    description: taskData.description,
    startDate: taskData.startDate,
    reminderTime: taskData.reminderTime,
    activeDays: {
      update: {
        ...taskData.activeDays,
      },
    },
  });

// Mutation
export type { TaskUpdateViewModel };
export default function editTask(
  prisma: PrismaClient,
  taskId: number | bigint,
  taskData: TaskUpdateViewModel
) {
  return prisma.task.update({
    where: taskHasId(taskId),
    data: modifyTask(taskData),
    select: taskIdOnly,
  });
}
