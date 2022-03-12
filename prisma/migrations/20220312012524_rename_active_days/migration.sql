/*
  Warnings:

  - You are about to drop the `task_active_days` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "new_task" DROP CONSTRAINT "new_task_activeDaysId_fkey";

-- AlterTable
ALTER TABLE task_active_days RENAME TO "active_days";

-- AddForeignKey
ALTER TABLE "new_task" ADD CONSTRAINT "new_task_activeDaysId_fkey" FOREIGN KEY ("activeDaysId") REFERENCES "active_days"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AlterTable
ALTER TABLE "active_days" RENAME CONSTRAINT "task_active_days_pkey" TO "active_days_pkey";
