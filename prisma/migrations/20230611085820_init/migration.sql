/*
  Warnings:

  - Added the required column `loansIssued` to the `Dsa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dsa` ADD COLUMN `loansIssued` INTEGER NOT NULL;
