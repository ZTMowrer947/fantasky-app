import { Prisma, PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

import { DetailedTask } from '@/lib/queries/tasks/fetchTask';

// Query filtering
const taskHasId = (id: number | bigint) =>
  Prisma.validator<Prisma.NewTaskWhereUniqueInput>()({
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

// Mutation alteration
const newDay = (date: Date) =>
  Prisma.validator<Prisma.NewTaskUpdateInput>()({
    completedDays: {
      connectOrCreate: {
        where: {
          date,
        },
        create: {
          date,
        },
      },
    },
  });

const removeDay = (taskId: number | bigint, dayId: number | bigint) =>
  Prisma.validator<Prisma.NewTaskUpdateInput>()({
    completedDays: {
      disconnect: {
        id: dayId,
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
  const matchingDay = task.completedDays.find((completedDay) =>
    DateTime.fromJSDate(completedDay.date).equals(dayToToggle)
  );

  return prisma.newTask.update({
    where: taskHasId(task.id),
    data: matchingDay
      ? removeDay(task.id, matchingDay.id)
      : newDay(dayToToggle.toJSDate()),
    select: detailedTask,
  });
}
