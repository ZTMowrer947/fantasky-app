interface DaysToRepeat {
  sun: boolean;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
}

const shortenedDaysOfWeek = {
  sun: 'Su',
  mon: 'M',
  tue: 'Tu',
  wed: 'W',
  thu: 'Th',
  fri: 'F',
  sat: 'Sa',
};

// eslint-disable-next-line import/prefer-default-export
export function formatDaysToRepeat(days: DaysToRepeat) {
  if (Object.values(days).every((isActive) => isActive)) {
    return 'Every day';
  }

  const { sun, mon, tue, wed, thu, fri, sat } = days;

  if (sun && sat) {
    return 'Every weekend';
  }

  if (mon && tue && wed && thu && fri) {
    return 'Every weekday';
  }

  const activeDays = Object.entries(days)
    .filter(([, isActive]) => isActive)
    .map(([day]) => shortenedDaysOfWeek[day as keyof DaysToRepeat]);

  return `${activeDays.join(', ')}`;
}
