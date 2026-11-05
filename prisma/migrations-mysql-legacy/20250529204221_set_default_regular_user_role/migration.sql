-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('SUPERADMIN', 'HR', 'EMPLOYEE', 'REGULAR_USER') NOT NULL DEFAULT 'REGULAR_USER';

-- Add the column with a default value to avoid migration errors
ALTER TABLE `Answer`
ADD COLUMN `agreementLevel` INT NOT NULL DEFAULT 0;
