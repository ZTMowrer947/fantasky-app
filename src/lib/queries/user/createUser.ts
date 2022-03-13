import { Prisma, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

// Mutation typing
const userCreateViewModel = Prisma.validator<Prisma.UserArgs>()({
  select: {
    firstName: true,
    lastName: true,
    emailAddress: true,
    password: true,
  },
});

export type UserCreateViewModel = Prisma.UserGetPayload<
  typeof userCreateViewModel
>;

// Mutation selection
const userEntry = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  firstName: true,
  lastName: true,
  emailAddress: true,
});

// Mutation input
const newUser = async (userData: UserCreateViewModel) =>
  Prisma.validator<Prisma.UserCreateInput>()({
    firstName: userData.firstName,
    lastName: userData.lastName,
    emailAddress: userData.emailAddress,
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
  userData: UserCreateViewModel
) {
  return prisma.user.create({
    data: await newUser(userData),
    select: userEntry,
  });
}
