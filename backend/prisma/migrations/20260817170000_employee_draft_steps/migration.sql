-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "hireDate" DROP NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "departmentId" DROP NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "positionId" DROP NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "employmentTypeId" DROP NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "educationLevelId" DROP NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "totalExperienceMonths" SET DEFAULT 0;
ALTER TABLE "Employee" ALTER COLUMN "militaryService" SET DEFAULT false;
ALTER TABLE "Employee" ALTER COLUMN "hasDriverLicense" SET DEFAULT false;
ALTER TABLE "Employee" ADD COLUMN "formStep" INTEGER NOT NULL DEFAULT 0;

-- Existing complete profiles resume from the start of the form
UPDATE "Employee" SET "formStep" = 4;
