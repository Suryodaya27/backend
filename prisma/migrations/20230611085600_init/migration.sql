/*
  Warnings:

  - Added the required column `amountLoan` to the `Dsa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commissionPercentage` to the `Dsa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loansIssued` to the `Dsa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dsa` ADD COLUMN `amountLoan` DOUBLE NOT NULL,
    ADD COLUMN `commissionPercentage` DOUBLE NOT NULL,
    ADD COLUMN `loansIssued` INTEGER NOT NULL;
