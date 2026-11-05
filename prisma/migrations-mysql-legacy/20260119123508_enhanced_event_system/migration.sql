/*
  Warnings:

  - You are about to drop the `attendance` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `eventRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_userId_fkey`;

-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `event_startupId_fkey`;

-- AlterTable
ALTER TABLE `event` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    ADD COLUMN `format` VARCHAR(191) NOT NULL DEFAULT 'IN_PERSON',
    ADD COLUMN `galleryImagesJson` JSON NULL,
    ADD COLUMN `isApprovalRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maxParticipants` INTEGER NULL,
    ADD COLUMN `price` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `qrCodeData` LONGTEXT NULL,
    ADD COLUMN `qrCodeUrl` LONGTEXT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'UPCOMING',
    ADD COLUMN `summary` TEXT NULL,
    ADD COLUMN `tags` JSON NULL,
    ADD COLUMN `venue` VARCHAR(191) NULL,
    MODIFY `type` VARCHAR(191) NOT NULL DEFAULT 'GENERAL',
    MODIFY `visibility` VARCHAR(191) NOT NULL DEFAULT 'ORG_ONLY',
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `eventregistration` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `ticketId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'REGISTERED';

-- DropTable
DROP TABLE `attendance`;

-- CreateTable
CREATE TABLE `eventAttendance` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NOT_ATTENDED',
    `checkInTime` DATETIME(3) NULL,
    `checkOutTime` DATETIME(3) NULL,
    `scannedAt` DATETIME(3) NULL,
    `qrCodeId` VARCHAR(191) NULL,
    `scannerUserId` VARCHAR(191) NULL,
    `durationMinutes` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `eventAttendance_userId_idx`(`userId`),
    INDEX `eventAttendance_eventId_idx`(`eventId`),
    INDEX `eventAttendance_status_idx`(`status`),
    UNIQUE INDEX `eventAttendance_eventId_userId_key`(`eventId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventApprovalRequest` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `rejectionReason` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `eventApprovalRequest_userId_idx`(`userId`),
    INDEX `eventApprovalRequest_status_idx`(`status`),
    UNIQUE INDEX `eventApprovalRequest_eventId_userId_key`(`eventId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventQRCode` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `qrImageUrl` LONGTEXT NULL,
    `qrData` LONGTEXT NULL,
    `totalScans` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `eventQRCode_code_key`(`code`),
    INDEX `eventQRCode_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userEventStats` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `startupId` VARCHAR(191) NOT NULL,
    `totalEventsJoined` INTEGER NOT NULL DEFAULT 0,
    `totalAttended` INTEGER NOT NULL DEFAULT 0,
    `totalHoursAttended` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `userEventStats_userId_idx`(`userId`),
    UNIQUE INDEX `userEventStats_userId_startupId_key`(`userId`, `startupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `event_status_idx` ON `event`(`status`);

-- CreateIndex
CREATE INDEX `event_visibility_idx` ON `event`(`visibility`);

-- CreateIndex
CREATE INDEX `eventRegistration_status_idx` ON `eventRegistration`(`status`);

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `event_startupId_fkey` FOREIGN KEY (`startupId`) REFERENCES `startup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventAttendance` ADD CONSTRAINT `eventAttendance_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventAttendance` ADD CONSTRAINT `eventAttendance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventAttendance` ADD CONSTRAINT `eventAttendance_scannerUserId_fkey` FOREIGN KEY (`scannerUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventApprovalRequest` ADD CONSTRAINT `eventApprovalRequest_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventApprovalRequest` ADD CONSTRAINT `eventApprovalRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventApprovalRequest` ADD CONSTRAINT `eventApprovalRequest_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventQRCode` ADD CONSTRAINT `eventQRCode_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userEventStats` ADD CONSTRAINT `userEventStats_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userEventStats` ADD CONSTRAINT `userEventStats_startupId_fkey` FOREIGN KEY (`startupId`) REFERENCES `startup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
