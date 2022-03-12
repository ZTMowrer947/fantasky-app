import { ActiveDays } from '@prisma/client';
import { DateTime } from 'luxon';

import { DetailedTask } from '@/lib/queries/tasks/fetchTask';

// eslint-disable-next-line import/prefer-default-export
export function formatDaysToRepeat(activeDays: Omit<ActiveDays, 'id'>) {
  if (Object.values(activeDays).every((isActive) => isActive)) {
    return 'Every day';
  }

  const activeOnWeekends = activeDays.sunday && activeDays.saturday;
  const activeOnWeekdays =
    activeDays.monday &&
    activeDays.tuesday &&
    activeDays.wednesday &&
    activeDays.thursday &&
    activeDays.friday;

  if (activeOnWeekends && !activeOnWeekdays) {
    return 'Every weekend';
  }

  if (activeOnWeekdays && !activeOnWeekends) {
    return 'Every weekday';
  }

  const activeDayStrings = Object.entries(activeDays)
    .filter(([, isActive]) => isActive)
    .map(([day]) =>
      [day.substring(0, 1).toUpperCase(), day.substring(1)].join('')
    );

  return `${activeDayStrings.join(', ')}`;
}

export function getStartOfCompletionStreak(task: DetailedTask) {
  if (task.completedDays.length === 0) return null;

  const today = DateTime.utc().startOf('day');
  const yesterday = today.minus({ days: 1 });

  const days = task.completedDays.map((day) =>
    DateTime.fromJSDate(day.date, { zone: 'utc' })
  );

  if (!days[0].equals(today) && !days[0].equals(yesterday)) return null;

  const streakStartIndex = days.findIndex((day, idx, array) => {
    const prevDay = idx < array.length - 1 ? array[idx + 1] : null;

    return !prevDay || !day.minus({ days: 1 }).equals(prevDay);
  });

  return streakStartIndex !== -1 ? days[streakStartIndex] : null;
}
