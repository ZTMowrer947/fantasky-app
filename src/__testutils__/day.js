// Imports
import dateFormat from 'dateformat';
import { date } from 'faker';

// Test helpers
/**
 * @param {Date} refDate
 */
function generateFakeDay(refDate = undefined) {
  // Define date for day
  const dateForDay = date.recent(52, refDate);

  // Define day data
  const dayData = {
    date: dateFormat(dateForDay, 'isoDate'),
  };

  // Return generated day
  return dayData;
}

function generateFakeDays(count = 5) {
  return Array.from({ length: count }).map((_, index, array) => {
    // If this is the first item in the array,
    if (index === 0) {
      // Generate a recent day from today
      return generateFakeDay();
    }

    // Otherwise, get previous date
    const { date: prevDate } = array[index - 1];

    // Generate recent day from that date to avoid uniqueness conflicts
    return generateFakeDay(new Date(prevDate));
  });
}

// Exports
export { generateFakeDay, generateFakeDays };
