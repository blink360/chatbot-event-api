/*
  Warnings:

  - A unique constraint covering the columns `[conversationId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conversationId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "conversationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_conversationId_key" ON "Event"("conversationId");
