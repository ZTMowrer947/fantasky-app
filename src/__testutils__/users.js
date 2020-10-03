// Imports
import argon2 from 'argon2';
import dateFormat from 'dateformat';
import { date, internet, name } from 'faker';

// Test helpers
async function generateFakeUser() {
  // Generate random name for user
  const firstName = name.firstName();
  const lastName = name.lastName();

  // Generate random dob
  const dob = date.past(35, new Date('06/01/2005'));

  // Define user data
  const user = {
    firstName,
    lastName,
    emailAddress: internet.email(firstName, lastName),
    password: await argon2.hash(internet.password(24)),
    dob: dateFormat(dob, 'isoDate'),
  };

  // Return generated user
  return user;
}

// Exports
// eslint-disable-next-line import/prefer-default-export
export { generateFakeUser };
