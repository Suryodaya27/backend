/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dsa` MODIFY `totalCommission` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `commissionRemaining` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_phoneNumber_key` ON `User`(`phoneNumber`);
