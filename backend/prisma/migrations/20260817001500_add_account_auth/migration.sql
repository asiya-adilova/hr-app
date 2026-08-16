-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "accountId" INTEGER;

-- Backfill accounts for existing employees
INSERT INTO "Account" ("email", "password", "role", "firstName", "lastName", "middleName", "createdAt", "updatedAt")
SELECT
    COALESCE(NULLIF(TRIM("email"), ''), 'employee-' || "id"::text || '@placeholder.local'),
    '$2a$10$unusablehashunusablehashunusablehashunu',
    'EMPLOYEE'::"Role",
    "firstName",
    "lastName",
    "middleName",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Employee";

UPDATE "Employee" AS e
SET "accountId" = a."id"
FROM "Account" AS a
WHERE a."email" = COALESCE(NULLIF(TRIM(e."email"), ''), 'employee-' || e."id"::text || '@placeholder.local');

ALTER TABLE "Employee" ALTER COLUMN "accountId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_accountId_key" ON "Employee"("accountId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "middleName";
