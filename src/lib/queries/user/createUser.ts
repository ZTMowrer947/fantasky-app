import { Prisma, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { DateTime } from 'luxon';

import UpsertUserDto from '@/dto/UpsertUserDto';

// Mutation selection
const userEntry = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  firstName: true,
  lastName: true,
  emailAddress: true,
});

// Mutation input
const newUser = async (userData: UpsertUserDto) =>
  Prisma.validator<Prisma.UserCreateInput>()({
    firstName: userData.firstName,
    lastName: userData.lastName,
    emailAddress: userData.emailAddress,
    dob: DateTime.fromSQL(userData.dob, { zone: 'utc' }).toJSDate(),
    password: await argon2.hash(userData.password, {
      timeCost: 10,
      memoryCost: 2 ** 16,
      type: argon2.argon2id,
      hashLength: 48,
    }),
  });

// Mutation
export default async function createUser(
  prisma: PrismaClient,
  userData: UpsertUserDto
) {
  return prisma.user.create({
    data: await newUser(userData),
    select: userEntry,
  });
}
