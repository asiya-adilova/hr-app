-- RenameTableColumn
ALTER TABLE "Employee" RENAME COLUMN "passportIssueDate" TO "passportExpireDate";

-- Existing issue dates are converted to typical 10-year expiry
UPDATE "Employee"
SET "passportExpireDate" = "passportExpireDate" + INTERVAL '10 years';
