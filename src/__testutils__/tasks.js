// Imports
import { date, random } from 'faker';

// Test helpers
function generateFakeTask(user) {
  // Define start date and convert to string
  const startDate = date.soon(64);

  // Define test task
  const task = {
    name: random.words(3),
    description: null,
    daysToRepeat: 0b1111111,
    reminderTime: null,
    startDate,
    creator: user,
    completedDays: [],
  };

  // Return generated task
  return task;
}

// Exports
// eslint-disable-next-line import/prefer-default-export
export { generateFakeTask };
