// Imports
import { plainToClass } from 'class-transformer';
import { date, internet, name } from 'faker';
import { DateTime } from 'luxon';

import UpsertUserDto from '@/dto/UpsertUserDto';
import User from '@/entities/User';

// Test helpers
function generateFakeUserData() {
  // Generate random name for user
  const firstName = name.firstName();
  const lastName = name.lastName();

  // Generate random dob
  const dob = DateTime.fromJSDate(date.past(35, '2005-06-01'), {
    zone: 'utc',
  }).toSQLDate();

  // Define user data
  const userData = {
    firstName,
    lastName,
    emailAddress: internet.email(firstName, lastName),
    password: internet.password(24),
    dob,
  };

  return userData;
}

function generateFakeUserDto() {
  // Define user data
  const userData = generateFakeUserData();

  // Convert to DTO class
  const userDto = plainToClass(UpsertUserDto, userData);

  // Return generated user
  return userDto;
}

function generateFakeUser() {
  // Define user data
  const userData = generateFakeUserData();

  // Convert into user class
  const user = plainToClass(User, userData);

  // Return generated user
  return user;
}

// Exports
export { generateFakeUser, generateFakeUserDto };
