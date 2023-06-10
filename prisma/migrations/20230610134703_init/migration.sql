/*
  Warnings:

  - You are about to drop the column `amount` on the `loan` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `loan` table. All the data in the column will be lost.
  - Added the required column `commissionRemaining` to the `Dsa` table without a default value. This is not possible if the table is not empty.
  - Made the column `commission` on table `loan` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `remark` to the `Status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dsa` ADD COLUMN `commissionRemaining` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `loan` DROP COLUMN `amount`,
    DROP COLUMN `duration`,
    MODIFY `commission` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `status` ADD COLUMN `remark` VARCHAR(191) NOT NULL;
