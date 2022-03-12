/*
  Warnings:

  - You are about to drop the `_DayToNewTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DayToNewTask" DROP CONSTRAINT "_DayToNewTask_A_fkey";

-- DropForeignKey
ALTER TABLE "_DayToNewTask" DROP CONSTRAINT "_DayToNewTask_B_fkey";

-- AlterTable
ALTER TABLE "_DayToNewTask" RENAME TO "_DayToTask";

-- CreateIndex
CREATE UNIQUE INDEX "_DayToTask_AB_unique" ON "_DayToTask"("A", "B");

-- CreateIndex
CREATE INDEX "_DayToTask_B_index" ON "_DayToTask"("B");

-- AddForeignKey
ALTER TABLE "_DayToTask" ADD FOREIGN KEY ("A") REFERENCES "day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DayToTask" ADD FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
