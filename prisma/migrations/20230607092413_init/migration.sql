/*
  Warnings:

  - You are about to drop the column `commission` on the `dsa` table. All the data in the column will be lost.
  - You are about to drop the column `commisssion` on the `loan` table. All the data in the column will be lost.
  - Added the required column `totalCommission` to the `Dsa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commissionAdded` to the `Status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dsa` DROP COLUMN `commission`,
    ADD COLUMN `totalCommission` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `loan` DROP COLUMN `commisssion`,
    ADD COLUMN `commission` DOUBLE NULL;

-- AlterTable
ALTER TABLE `status` ADD COLUMN `commissionAdded` BOOLEAN NOT NULL;
