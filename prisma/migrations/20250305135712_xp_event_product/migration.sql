-- CreateTable
CREATE TABLE `product_xp_boost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `boostAmount` INTEGER NOT NULL,
    `boostDuration` INTEGER NOT NULL,

    UNIQUE INDEX `product_xp_boost_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_xp_boost` ADD CONSTRAINT `product_xp_boost_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `xp_event` ADD CONSTRAINT `xp_event_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
