import { ActiveDays } from '@prisma/client';

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
