-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('AVAILABLE', 'BLOCKED', 'CUSTOM_PRICE');

-- CreateTable
CREATE TABLE "FieldBookingPlan" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "daysOfWeek" INTEGER[],
    "specificDate" TIMESTAMP(3),
    "priceOverride" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldBookingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FieldBookingPlan_fieldId_idx" ON "FieldBookingPlan"("fieldId");

-- CreateIndex
CREATE INDEX "FieldBookingPlan_specificDate_idx" ON "FieldBookingPlan"("specificDate");

-- AddForeignKey
ALTER TABLE "FieldBookingPlan" ADD CONSTRAINT "FieldBookingPlan_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
