/*
  Warnings:

  - You are about to drop the column `isAutorized` on the `user` table. All the data in the column will be lost.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `isAutorized`,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;
