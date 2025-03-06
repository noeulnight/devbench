/*
  Warnings:

  - You are about to drop the `config` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `lastKoreanbotsHeart` DATETIME(3) NULL;

-- DropTable
DROP TABLE `config`;
