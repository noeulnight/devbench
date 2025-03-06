/*
  Warnings:

  - You are about to drop the column `boostDuration` on the `product_xp_boost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product_xp_boost` DROP COLUMN `boostDuration`,
    ADD COLUMN `boostDays` INTEGER NOT NULL DEFAULT 30,
    MODIFY `boostAmount` INTEGER NOT NULL DEFAULT 100;

-- CreateTable
CREATE TABLE `personal_channel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `channelDays` INTEGER NOT NULL DEFAULT 30,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `personal_channel` ADD CONSTRAINT `personal_channel_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
