/*
  Warnings:

  - You are about to drop the `new_task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DayToNewTask" DROP CONSTRAINT "_DayToNewTask_B_fkey";

-- DropForeignKey
ALTER TABLE "new_task" DROP CONSTRAINT "new_task_activeDaysId_fkey";

-- DropForeignKey
ALTER TABLE "new_task" DROP CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7";

-- AlterTable
ALTER TABLE "new_task" RENAME TO "task";

-- CreateIndex
CREATE UNIQUE INDEX "task_activeDaysId_key" ON "task"("activeDaysId");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_activeDaysId_fkey" FOREIGN KEY ("activeDaysId") REFERENCES "active_days"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_DayToNewTask" ADD FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "task" RENAME CONSTRAINT "new_task_pkey" TO "task_pkey";
