/*
  Warnings:

  - You are about to drop the column `commissionPercentage` on the `dsa` table. All the data in the column will be lost.
  - You are about to drop the column `loansIssued` on the `dsa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `dsa` DROP COLUMN `commissionPercentage`,
    DROP COLUMN `loansIssued`;
