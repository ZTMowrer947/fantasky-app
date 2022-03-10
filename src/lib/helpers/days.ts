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

export function serializeDaysToRepeat(days: DaysToRepeat) {
  // Extract booleans
  const { sun, mon, tue, wed, thu, fri, sat } = days;

  // Reverse and store as array
  const digits = [sat, fri, thu, wed, tue, mon, sun];

  const digitString = digits.map((digit) => Number(digit).toString()).join('');

  return Number.parseInt(digitString, 2);
}

export function deserializeDaysToRepeat(serialized: number): DaysToRepeat {
  // Format serialized value as base-2
  let binaryString = serialized.toString(2);

  // Pad string if needed
  if (binaryString.length < 7) {
    binaryString = '0'.repeat(7 - binaryString.length) + binaryString;
  }

  // Split into digits and convert to booleans
  const [sat, fri, thu, wed, tue, mon, sun] = binaryString
    .split('')
    .map((digit) => !!Number.parseInt(digit, 2));

  return { sun, mon, tue, wed, thu, fri, sat };
}

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
