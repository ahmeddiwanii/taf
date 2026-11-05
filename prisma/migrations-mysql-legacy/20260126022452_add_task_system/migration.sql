/*
  Warnings:

  - You are about to drop the column `relatedTeamId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `event_relatedTeamId_fkey`;

-- DropForeignKey
ALTER TABLE `project` DROP FOREIGN KEY `project_teamId_fkey`;

-- DropIndex
DROP INDEX `event_relatedTeamId_idx` ON `event`;

-- DropIndex
DROP INDEX `project_teamId_idx` ON `project`;

-- AlterTable
ALTER TABLE `event` DROP COLUMN `relatedTeamId`,
    ADD COLUMN `posterUrl` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `teamId`;

-- AlterTable
ALTER TABLE `team` ADD COLUMN `eventId` VARCHAR(191) NULL,
    ADD COLUMN `projectId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `teamTask` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'TODO',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `createdById` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `teamTask_teamId_idx`(`teamId`),
    INDEX `teamTask_createdById_idx`(`createdById`),
    INDEX `teamTask_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teamTaskAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `teamMemberId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ASSIGNED',
    `submittedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `approvalComment` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `creditsAwarded` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `teamTaskAssignment_userId_idx`(`userId`),
    INDEX `teamTaskAssignment_taskId_idx`(`taskId`),
    INDEX `teamTaskAssignment_status_idx`(`status`),
    INDEX `teamTaskAssignment_approvalStatus_idx`(`approvalStatus`),
    UNIQUE INDEX `teamTaskAssignment_taskId_userId_key`(`taskId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memberCredit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `startupId` VARCHAR(191) NOT NULL,
    `totalCredits` DOUBLE NOT NULL DEFAULT 0,
    `creditsJson` JSON NULL,
    `tasksCompleted` INTEGER NOT NULL DEFAULT 0,
    `tasksApproved` INTEGER NOT NULL DEFAULT 0,
    `tasksRejected` INTEGER NOT NULL DEFAULT 0,
    `approvalRate` DOUBLE NOT NULL DEFAULT 0,
    `achievementBadges` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `memberCredit_userId_idx`(`userId`),
    INDEX `memberCredit_startupId_idx`(`startupId`),
    UNIQUE INDEX `memberCredit_userId_startupId_key`(`userId`, `startupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventFeedback` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NULL,
    `comment` TEXT NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `eventFeedback_eventId_idx`(`eventId`),
    INDEX `eventFeedback_userId_idx`(`userId`),
    UNIQUE INDEX `eventFeedback_eventId_userId_key`(`eventId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `team_eventId_idx` ON `team`(`eventId`);

-- CreateIndex
CREATE INDEX `team_projectId_idx` ON `team`(`projectId`);

-- AddForeignKey
ALTER TABLE `team` ADD CONSTRAINT `team_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team` ADD CONSTRAINT `team_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teamTask` ADD CONSTRAINT `teamTask_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teamTask` ADD CONSTRAINT `teamTask_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teamTaskAssignment` ADD CONSTRAINT `teamTaskAssignment_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `teamTask`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teamTaskAssignment` ADD CONSTRAINT `teamTaskAssignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teamTaskAssignment` ADD CONSTRAINT `teamTaskAssignment_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberCredit` ADD CONSTRAINT `memberCredit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberCredit` ADD CONSTRAINT `memberCredit_startupId_fkey` FOREIGN KEY (`startupId`) REFERENCES `startup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventFeedback` ADD CONSTRAINT `eventFeedback_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventFeedback` ADD CONSTRAINT `eventFeedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
