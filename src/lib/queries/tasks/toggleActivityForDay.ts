import { Prisma, PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

import { DetailedTask } from '@/lib/queries/tasks/fetchTask';

// Query filtering
const taskHasId = (id: number | bigint) =>
  Prisma.validator<Prisma.TaskWhereUniqueInput>()({
    id,
  });

// Query selection
const detailedTask = Prisma.validator<Prisma.TaskSelect>()({
  id: true,
  name: true,
  description: true,
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

// Mutation alteration
const newDay = (date: Date) =>
  Prisma.validator<Prisma.TaskUpdateInput>()({
    tasksToDays: {
      create: {
        day: {
          connectOrCreate: {
            where: {
              date,
            },
            create: {
              date,
            },
          },
        },
      },
    },
  });

const removeDay = (taskId: number | bigint, dayId: number | bigint) =>
  Prisma.validator<Prisma.TaskUpdateInput>()({
    tasksToDays: {
      delete: {
        taskId_dayId: { taskId, dayId },
      },
    },
  });

export default function toggleActivityForDay(
  prisma: PrismaClient,
  creatorId: number,
  task: DetailedTask,
  day: Date
) {
  const dayToToggle = DateTime.fromJSDate(day);
  const matchingTaskToDay = task.tasksToDays.find((taskToDay) =>
    DateTime.fromJSDate(taskToDay.day.date).equals(dayToToggle)
  );

  return prisma.task.update({
    where: taskHasId(task.id),
    data: matchingTaskToDay
      ? removeDay(task.id, matchingTaskToDay.day.id)
      : newDay(dayToToggle.toJSDate()),
    select: detailedTask,
  });
}
