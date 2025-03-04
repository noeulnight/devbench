-- AlterTable
ALTER TABLE `punishment_history` ADD COLUMN `reason` VARCHAR(191) NULL,
    ADD COLUMN `weight` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `warn` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `warn_type` ADD COLUMN `description` VARCHAR(191) NULL;
