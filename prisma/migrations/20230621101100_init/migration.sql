/*
  Warnings:

  - You are about to drop the column `duration` on the `application` table. All the data in the column will be lost.
  - Added the required column `monthly_income` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `application` DROP COLUMN `duration`,
    ADD COLUMN `monthly_income` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Prefr` (
    `applicationId` INTEGER NOT NULL,
    `loanId` INTEGER NOT NULL,

    UNIQUE INDEX `Prefr_applicationId_key`(`applicationId`),
    PRIMARY KEY (`applicationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prefr` ADD CONSTRAINT `Prefr_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
