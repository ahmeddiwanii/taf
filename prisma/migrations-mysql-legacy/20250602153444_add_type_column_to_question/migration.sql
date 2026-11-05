/*
  Warnings:

  - You are about to drop the column `selectedOption` on the `answer` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `answer` DROP COLUMN `selectedOption`;

-- AlterTable
ALTER TABLE `question` DROP COLUMN `options`,
    ADD COLUMN `type` ENUM('AGREEMENT_SCALE', 'MULTIPLE_CHOICE') NOT NULL DEFAULT 'AGREEMENT_SCALE';
