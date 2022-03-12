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
  const days = task.completedDays.map((day) =>
    DateTime.fromJSDate(day.date, { zone: 'utc' })
  );

  const reversedStreakStartIndex = [...days]
    .sort((a, b) => a.toMillis() - b.toMillis())
    .reverse()
    .findIndex((day, idx, array) => {
      const nextDay = idx < array.length - 1 ? array[idx + 1] : null;

      return nextDay && day.plus({ days: 1 }).equals(nextDay);
    });
  const streakStartIndex =
    reversedStreakStartIndex >= 0
      ? days.length - 1 - reversedStreakStartIndex
      : reversedStreakStartIndex;

  const streak = days.slice(streakStartIndex);

  return streak.length > 0 ? streak[0] : null;
}
