/*
  Warnings:

  - You are about to drop the column `City` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `Pincode` on the `user` table. All the data in the column will be lost.
  - Added the required column `city` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `City`,
    DROP COLUMN `Name`,
    DROP COLUMN `Pincode`,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `pincode` VARCHAR(191) NOT NULL;
