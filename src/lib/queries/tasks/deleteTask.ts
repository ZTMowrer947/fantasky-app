import { Prisma, PrismaClient } from '@prisma/client';

// Mutation filtering
const taskHasId = (id: number | bigint) =>
  Prisma.validator<Prisma.TaskWhereInput>()({
    id,
  });

// Mutation
export default function deleteTask(
  prisma: PrismaClient,
  taskId: number | bigint
) {
  return prisma.task.delete({
    where: taskHasId(taskId),
    select: { id: true },
  });
}
