-- CreateTable
CREATE TABLE IF NOT EXISTS "task_active_days" (
  "id" BIGSERIAL NOT NULL,
  "sunday" BOOLEAN NOT NULL DEFAULT false,
  "monday" BOOLEAN NOT NULL DEFAULT false,
  "tuesday" BOOLEAN NOT NULL DEFAULT false,
  "wednesday" BOOLEAN NOT NULL DEFAULT false,
  "thursday" BOOLEAN NOT NULL DEFAULT false,
  "friday" BOOLEAN NOT NULL DEFAULT false,
  "saturday" BOOLEAN NOT NULL DEFAULT false,
  "taskId" BIGSERIAL NOT NULL,

  CONSTRAINT "task_active_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "new_task" (
  "id" BIGSERIAL NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL,
  "name" VARCHAR NOT NULL,
  "description" TEXT,
  "startDate" DATE NOT NULL DEFAULT CURRENT_DATE,
  "reminderTime" TIMETZ(6),
  "activeDaysId" BIGINT,
  "creatorId" BIGINT NOT NULL,

  CONSTRAINT "new_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DayToNewTask" (
                               "A" BIGINT NOT NULL,
                               "B" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "new_task_activeDaysId_key" ON "new_task"("activeDaysId");

-- CreateIndex
CREATE UNIQUE INDEX "_DayToNewTask_AB_unique" ON "_DayToNewTask"("A", "B");

-- CreateIndex
CREATE INDEX "_DayToNewTask_B_index" ON "_DayToNewTask"("B");

-- AddForeignKey
ALTER TABLE "new_task" ADD CONSTRAINT "new_task_activeDaysId_fkey" FOREIGN KEY ("activeDaysId") REFERENCES "task_active_days"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "new_task" ADD CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_DayToNewTask" ADD FOREIGN KEY ("A") REFERENCES "day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DayToNewTask" ADD FOREIGN KEY ("B") REFERENCES "new_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Task migration
INSERT INTO "new_task" (id, "createdAt", "updatedAt", name, description, "startDate", "reminderTime", "creatorId")
  SELECT id, "createdAt", "updatedAt", name, description, "startDate", "reminderTime", "creatorId" FROM task;

-- Task-to-Day migration
INSERT INTO "_DayToNewTask" ("A", "B") SELECT "dayId", "taskId" FROM task_completed_days_day;

-- Active day migration
INSERT INTO "task_active_days"("sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "taskId")
  SELECT BOOL(MOD("daysToRepeat", 2)),
         BOOL(MOD("daysToRepeat" / 2, 2)),
         BOOL(MOD("daysToRepeat" / 4, 2)),
         BOOL(MOD("daysToRepeat" / 8, 2)),
         BOOL(MOD("daysToRepeat" / 16, 2)),
         BOOL(MOD("daysToRepeat" / 32, 2)),
         BOOL(MOD("daysToRepeat" / 64, 2)),
         id FROM task;

-- Linking tasks and active days
UPDATE new_task SET "activeDaysId" = "task_active_days".id
  FROM "task_active_days"
  WHERE new_task.id = "task_active_days"."taskId";

-- Setting active-days id to non-nullable
ALTER TABLE new_task ALTER "activeDaysId" SET NOT NULL;

-- Dropping now-extraneous task id
ALTER TABLE task_active_days DROP "taskId";
