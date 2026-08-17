-- AlterTable
ALTER TABLE "WorkExperience" ADD COLUMN "positionId" INTEGER;

-- Map existing job titles onto Position by name (case-insensitive)
UPDATE "WorkExperience" AS experience
SET "positionId" = position.id
FROM "Position" AS position
WHERE experience."positionId" IS NULL
  AND lower(position.name) = lower(experience.position);

-- Create Position rows for titles that are not in the catalog yet
INSERT INTO "Position" (name)
SELECT DISTINCT experience.position
FROM "WorkExperience" AS experience
WHERE experience."positionId" IS NULL
  AND btrim(experience.position) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM "Position" AS position
    WHERE lower(position.name) = lower(experience.position)
  );

-- Retry mapping after inserting missing titles
UPDATE "WorkExperience" AS experience
SET "positionId" = position.id
FROM "Position" AS position
WHERE experience."positionId" IS NULL
  AND lower(position.name) = lower(experience.position);

UPDATE "WorkExperience"
SET "positionId" = (SELECT id FROM "Position" ORDER BY id ASC LIMIT 1)
WHERE "positionId" IS NULL;

ALTER TABLE "WorkExperience" ALTER COLUMN "positionId" SET NOT NULL;

ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkExperience" DROP COLUMN "position";
