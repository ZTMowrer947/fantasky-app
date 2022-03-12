import { Prisma, PrismaClient } from '@prisma/client';

import UpsertTaskDto from '@/dto/UpsertTaskDto';

// Mutation filtering
const taskHasId = (id: number | bigint) =>
  Prisma.validator<Prisma.NewTaskWhereInput>()({
    id,
  });

// Mutation selection
const taskIdOnly = Prisma.validator<Prisma.NewTaskSelect>()({
  id: true,
});

// Mutation input
const modifyTask = (taskData: UpsertTaskDto) =>
  Prisma.validator<Prisma.NewTaskUpdateInput>()({
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
export default function editTask(
  prisma: PrismaClient,
  taskId: number | bigint,
  taskData: UpsertTaskDto
) {
  return prisma.newTask.update({
    where: taskHasId(taskId),
    data: modifyTask(taskData),
    select: taskIdOnly,
  });
}
