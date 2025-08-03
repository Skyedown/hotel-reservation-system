-- CreateEnum
CREATE TYPE "public"."EmailType" AS ENUM ('PAYMENT_REMINDER_24H', 'PAYMENT_REMINDER_1H', 'PAYMENT_FINAL_WARNING', 'CHECKIN_REMINDER_24H', 'CHECKIN_REMINDER_2H', 'CHECKOUT_REMINDER');

-- CreateEnum
CREATE TYPE "public"."ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "webhookEventId" TEXT;

-- AlterTable
ALTER TABLE "public"."reservations" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastStatusChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "public"."email_reminders" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "emailType" "public"."EmailType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "public"."ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_reminders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."email_reminders" ADD CONSTRAINT "email_reminders_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;