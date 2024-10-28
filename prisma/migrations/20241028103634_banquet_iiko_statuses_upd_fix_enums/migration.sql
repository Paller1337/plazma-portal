/*
  Warnings:

  - The values [new,error,success,inProgress] on the enum `BanquetIikoStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BanquetIikoStatus_new" AS ENUM ('New', 'Error', 'Success', 'InProgress');
ALTER TABLE "banquets" ALTER COLUMN "iikoStatus" DROP DEFAULT;
ALTER TABLE "banquets" ALTER COLUMN "iikoStatus" TYPE "BanquetIikoStatus_new" USING ("iikoStatus"::text::"BanquetIikoStatus_new");
ALTER TYPE "BanquetIikoStatus" RENAME TO "BanquetIikoStatus_old";
ALTER TYPE "BanquetIikoStatus_new" RENAME TO "BanquetIikoStatus";
DROP TYPE "BanquetIikoStatus_old";
ALTER TABLE "banquets" ALTER COLUMN "iikoStatus" SET DEFAULT 'New';
COMMIT;

-- AlterTable
ALTER TABLE "banquets" ALTER COLUMN "iikoStatus" SET DEFAULT 'New';
