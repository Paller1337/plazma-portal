-- CreateEnum
CREATE TYPE "BanquetStatus" AS ENUM ('sent', 'not_sent');

-- CreateTable
CREATE TABLE "banquets" (
    "id" TEXT NOT NULL,
    "idN" TEXT,
    "status" "BanquetStatus" NOT NULL,
    "banquetData" JSONB NOT NULL,
    "needSum" INTEGER,
    "payments" JSONB,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "banquets_pkey" PRIMARY KEY ("id")
);
