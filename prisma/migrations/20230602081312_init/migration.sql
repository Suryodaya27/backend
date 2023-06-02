/*
  Warnings:

  - The primary key for the `bank` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bank_name` on the `bank` table. All the data in the column will be lost.
  - You are about to drop the column `bank_url` on the `bank` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `bank` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[name]` on the table `Bank` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Bank_bank_name_key` ON `bank`;

-- AlterTable
ALTER TABLE `bank` DROP PRIMARY KEY,
    DROP COLUMN `bank_name`,
    DROP COLUMN `bank_url`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Loan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeId` INTEGER NOT NULL,
    `bankId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `interest` DOUBLE NOT NULL,
    `duration` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoanType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `LoanType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Bank_name_key` ON `Bank`(`name`);

-- AddForeignKey
ALTER TABLE `Loan` ADD CONSTRAINT `Loan_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `LoanType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loan` ADD CONSTRAINT `Loan_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
