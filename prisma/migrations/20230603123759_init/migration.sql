/*
  Warnings:

  - You are about to drop the column `bank_name` on the `bank` table. All the data in the column will be lost.
  - You are about to drop the column `loan_name` on the `loantype` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bankName]` on the table `Bank` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[loanName]` on the table `LoanType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bankName` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loanName` to the `LoanType` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Bank_bank_name_key` ON `bank`;

-- DropIndex
DROP INDEX `LoanType_loan_name_key` ON `loantype`;

-- AlterTable
ALTER TABLE `bank` DROP COLUMN `bank_name`,
    ADD COLUMN `bankName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `loantype` DROP COLUMN `loan_name`,
    ADD COLUMN `loanName` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Application` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationName` VARCHAR(191) NOT NULL,
    `applicationGovId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `loanId` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,
    `applicationId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Bank_bankName_key` ON `Bank`(`bankName`);

-- CreateIndex
CREATE UNIQUE INDEX `LoanType_loanName_key` ON `LoanType`(`loanName`);

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `Loan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Status` ADD CONSTRAINT `Status_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
