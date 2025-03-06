-- CreateTable
CREATE TABLE `config` (
    `key` ENUM('KORANBOTS_WEBHOOK_SECRET') NOT NULL,
    `value` VARCHAR(191) NULL,
    `valueInt` INTEGER NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
