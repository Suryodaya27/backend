/*
  Warnings:

  - The primary key for the `prefr` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `prefr` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`loanId`);
