-- AlterTable
ALTER TABLE "Education" ADD COLUMN "educationLevelId" INTEGER;

UPDATE "Education" AS education
SET "educationLevelId" = employee."educationLevelId"
FROM "Employee" AS employee
WHERE education."employeeId" = employee.id
  AND education."educationLevelId" IS NULL
  AND employee."educationLevelId" IS NOT NULL;

UPDATE "Education"
SET "educationLevelId" = (SELECT id FROM "EducationLevel" ORDER BY id ASC LIMIT 1)
WHERE "educationLevelId" IS NULL;

ALTER TABLE "Education" ALTER COLUMN "educationLevelId" SET NOT NULL;

ALTER TABLE "Education" ADD CONSTRAINT "Education_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "EducationLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Employee" DROP CONSTRAINT "Employee_educationLevelId_fkey";

ALTER TABLE "Employee" DROP COLUMN "educationLevelId";
