/*
  Warnings:

  - You are about to drop the column `channelDays` on the `personal_channel` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `personal_channel` table. All the data in the column will be lost.
  - Added the required column `channelId` to the `personal_channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `personal_channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `personal_channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `personal_channel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `personal_channel` DROP FOREIGN KEY `personal_channel_productId_fkey`;

-- DropIndex
DROP INDEX `personal_channel_productId_key` ON `personal_channel`;

-- AlterTable
ALTER TABLE `personal_channel` DROP COLUMN `channelDays`,
    DROP COLUMN `productId`,
    ADD COLUMN `channelId` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `product_personal_channel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `channelDays` INTEGER NOT NULL DEFAULT 30,

    UNIQUE INDEX `product_personal_channel_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_personal_channel` ADD CONSTRAINT `product_personal_channel_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personal_channel` ADD CONSTRAINT `personal_channel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
