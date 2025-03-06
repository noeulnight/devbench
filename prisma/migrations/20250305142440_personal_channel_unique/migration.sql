/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `personal_channel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `personal_channel_userId_key` ON `personal_channel`(`userId`);
