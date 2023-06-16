/*
  Warnings:

  - Added the required column `City` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Pincode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `City` VARCHAR(191) NOT NULL,
    ADD COLUMN `Name` VARCHAR(191) NOT NULL,
    ADD COLUMN `Pincode` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Admin` (
    `adminId` INTEGER NOT NULL AUTO_INCREMENT,
    `adminUsername` VARCHAR(191) NOT NULL,
    `adminEmail` VARCHAR(191) NOT NULL,
    `adminPassword` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Admin_adminId_key`(`adminId`),
    UNIQUE INDEX `Admin_adminUsername_key`(`adminUsername`),
    UNIQUE INDEX `Admin_adminEmail_key`(`adminEmail`),
    PRIMARY KEY (`adminId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
