// Imports
import { date, internet, name } from 'faker';
import { DateTime } from 'luxon';

// Test helpers
function generateFakeUser() {
  // Generate random name for user
  const firstName = name.firstName();
  const lastName = name.lastName();

  // Generate random dob
  const dob = DateTime.fromJSDate(date.past(35, '2005-06-01'), {
    zone: 'utc',
  }).toSQLDate();

  // Define user data
  const user = {
    firstName,
    lastName,
    emailAddress: internet.email(firstName, lastName),
    password: internet.password(24),
    dob,
  };

  // Return generated user
  return user;
}

// Exports
// eslint-disable-next-line import/prefer-default-export
export { generateFakeUser };
