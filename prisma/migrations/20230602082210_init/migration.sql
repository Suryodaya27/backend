/*
  Warnings:

  - You are about to drop the column `name` on the `bank` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `loantype` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bank_name]` on the table `Bank` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[loan_name]` on the table `LoanType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bank_name` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loan_name` to the `LoanType` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Bank_name_key` ON `bank`;

-- DropIndex
DROP INDEX `LoanType_name_key` ON `loantype`;

-- AlterTable
ALTER TABLE `bank` DROP COLUMN `name`,
    ADD COLUMN `bank_name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `loantype` DROP COLUMN `name`,
    ADD COLUMN `loan_name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Bank_bank_name_key` ON `Bank`(`bank_name`);

-- CreateIndex
CREATE UNIQUE INDEX `LoanType_loan_name_key` ON `LoanType`(`loan_name`);
