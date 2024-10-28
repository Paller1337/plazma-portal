-- CreateEnum
CREATE TYPE "BanquetIikoStatus" AS ENUM ('new', 'error', 'success');

-- AlterTable
ALTER TABLE "banquets" ADD COLUMN     "iikoId" TEXT,
ADD COLUMN     "iikoMessage" TEXT,
ADD COLUMN     "iikoStatus" "BanquetIikoStatus" DEFAULT 'new';
