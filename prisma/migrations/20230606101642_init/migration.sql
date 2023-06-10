-- AlterTable
ALTER TABLE `loan` ADD COLUMN `commisssion` DOUBLE NULL;

-- CreateTable
CREATE TABLE `Dsa` (
    `dsaId` INTEGER NOT NULL,
    `commission` DOUBLE NOT NULL,

    UNIQUE INDEX `Dsa_dsaId_key`(`dsaId`),
    PRIMARY KEY (`dsaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dsa` ADD CONSTRAINT `Dsa_dsaId_fkey` FOREIGN KEY (`dsaId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
