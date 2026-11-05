-- CreateTable
CREATE TABLE `startupProfile` (
    `id` VARCHAR(191) NOT NULL,
    `startupId` VARCHAR(191) NOT NULL,
    `profileImageUrl` VARCHAR(191) NULL,
    `coverImageUrl` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `galleryImagesJson` JSON NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `startupProfile_startupId_key`(`startupId`),
    INDEX `startupProfile_startupId_idx`(`startupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizationPost` (
    `id` VARCHAR(191) NOT NULL,
    `startupId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `organizationPost_startupId_idx`(`startupId`),
    INDEX `organizationPost_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventRegistration` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'registered',
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `eventRegistration_userId_idx`(`userId`),
    UNIQUE INDEX `eventRegistration_eventId_userId_key`(`eventId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `startupProfile` ADD CONSTRAINT `startupProfile_startupId_fkey` FOREIGN KEY (`startupId`) REFERENCES `startup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizationPost` ADD CONSTRAINT `organizationPost_startupId_fkey` FOREIGN KEY (`startupId`) REFERENCES `startup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizationPost` ADD CONSTRAINT `organizationPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventRegistration` ADD CONSTRAINT `eventRegistration_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventRegistration` ADD CONSTRAINT `eventRegistration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
