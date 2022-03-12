/*
  Warnings:

  - You are about to drop the `task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_completed_days_day` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7";

-- DropForeignKey
ALTER TABLE "task_completed_days_day" DROP CONSTRAINT "FK_3ec35ab07267cf7eaddae54b9e8";

-- DropForeignKey
ALTER TABLE "task_completed_days_day" DROP CONSTRAINT "FK_ffb64c1dfb28aedde4958e45432";

-- DropTable
DROP TABLE "task";

-- DropTable
DROP TABLE "task_completed_days_day";
