/*
  Warnings:

  - The `roles` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "roles",
ADD COLUMN     "roles" JSONB;

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");
