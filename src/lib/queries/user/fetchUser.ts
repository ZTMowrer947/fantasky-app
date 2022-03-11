import { Prisma, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

// Query selection
const userEntry = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  firstName: true,
  lastName: true,
  emailAddress: true,
  password: true,
});

// Query filtering
const userHasEmail = (email: string) =>
  Prisma.validator<Prisma.UserWhereUniqueInput>()({
    emailAddress: email,
  });

// Query
export default async function fetchUser(
  prisma: PrismaClient,
  email: string,
  password?: string
) {
  const user = await prisma.user.findUnique({
    select: userEntry,
    where: userHasEmail(email),
  });

  if (!user) return null;

  const { password: hash, ...userData } = user;

  if (!password) return userData;

  const passwordValid = await argon2.verify(hash, password);

  return passwordValid ? userData : null;
}
