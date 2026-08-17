-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "City_countryId_name_key" ON "City"("countryId", "name");

ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Country" ("name") VALUES ('Узбекистан');
INSERT INTO "City" ("name", "countryId")
SELECT 'Ташкент', "id" FROM "Country" WHERE "name" = 'Узбекистан';

ALTER TABLE "Employee" ADD COLUMN "countryId" INTEGER;
ALTER TABLE "Employee" ADD COLUMN "cityId" INTEGER;
ALTER TABLE "Education" ADD COLUMN "countryId" INTEGER;
ALTER TABLE "Education" ADD COLUMN "cityId" INTEGER;
ALTER TABLE "WorkExperience" ADD COLUMN "countryId" INTEGER;
ALTER TABLE "WorkExperience" ADD COLUMN "cityId" INTEGER;

UPDATE "Employee"
SET
    "countryId" = (SELECT "id" FROM "Country" WHERE "name" = 'Узбекистан'),
    "cityId" = (SELECT "id" FROM "City" WHERE "name" = 'Ташкент' LIMIT 1)
WHERE "countryId" IS NULL;

UPDATE "Education"
SET
    "countryId" = (SELECT "id" FROM "Country" WHERE "name" = 'Узбекистан'),
    "cityId" = (SELECT "id" FROM "City" WHERE "name" = 'Ташкент' LIMIT 1)
WHERE "countryId" IS NULL;

UPDATE "WorkExperience"
SET
    "countryId" = (SELECT "id" FROM "Country" WHERE "name" = 'Узбекистан'),
    "cityId" = (SELECT "id" FROM "City" WHERE "name" = 'Ташкент' LIMIT 1)
WHERE "countryId" IS NULL;

ALTER TABLE "Employee" ALTER COLUMN "countryId" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "cityId" SET NOT NULL;
ALTER TABLE "Education" ALTER COLUMN "countryId" SET NOT NULL;
ALTER TABLE "Education" ALTER COLUMN "cityId" SET NOT NULL;
ALTER TABLE "WorkExperience" ALTER COLUMN "countryId" SET NOT NULL;
ALTER TABLE "WorkExperience" ALTER COLUMN "cityId" SET NOT NULL;

ALTER TABLE "Employee" ADD CONSTRAINT "Employee_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Education" ADD CONSTRAINT "Education_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Education" ADD CONSTRAINT "Education_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
