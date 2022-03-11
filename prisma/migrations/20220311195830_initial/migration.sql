-- CreateTable
CREATE TABLE "day" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "PK_42e726f6b72349f70b25598b50e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "deletedAt" TIMESTAMP(6),
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "startDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "reminderTime" TIMETZ(6),
    "daysToRepeat" SMALLINT NOT NULL,
    "creatorId" BIGINT NOT NULL,

    CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_completed_days_day" (
    "taskId" BIGINT NOT NULL,
    "dayId" BIGINT NOT NULL,

    CONSTRAINT "PK_4bd5ea70d87f8c0b4b053e56799" PRIMARY KEY ("taskId","dayId")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(6),
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    "emailAddress" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "dob" DATE NOT NULL,

    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UQ_e4662724cf9f92100be40f24ee0" ON "day"("date");

-- CreateIndex
CREATE INDEX "IDX_3ec35ab07267cf7eaddae54b9e" ON "task_completed_days_day"("dayId");

-- CreateIndex
CREATE INDEX "IDX_ffb64c1dfb28aedde4958e4543" ON "task_completed_days_day"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_eea9ba2f6e1bb8cb89c4e672f62" ON "user"("emailAddress");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_completed_days_day" ADD CONSTRAINT "FK_3ec35ab07267cf7eaddae54b9e8" FOREIGN KEY ("dayId") REFERENCES "day"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_completed_days_day" ADD CONSTRAINT "FK_ffb64c1dfb28aedde4958e45432" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
