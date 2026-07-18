/*
  Warnings:

  - You are about to drop the `hearings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `approvingBody` on the `resolutions` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `resolutions` table. All the data in the column will be lost.
  - You are about to drop the column `hearingCycle` on the `resolutions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "hearings_resolutionId_cycle_hearingNumber_key";

-- DropIndex
DROP INDEX "hearings_resolutionId_cycle_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "hearings";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "committees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "committee_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "committeeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "committee_members_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "calendar_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resolutionId" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "sessionDate" DATETIME NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "calendar_items_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "resolutions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "committee_referrals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resolutionId" INTEGER NOT NULL,
    "committeeId" INTEGER NOT NULL,
    "referredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hearingHeldAt" DATETIME,
    "reportFindings" TEXT,
    "reportRecommendation" TEXT,
    "reportSubmittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "committee_referrals_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "resolutions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "committee_referrals_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_resolutions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resolutionNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "term" TEXT,
    "who" TEXT,
    "what" TEXT,
    "when" DATETIME,
    "where" TEXT,
    "why" TEXT,
    "how" TEXT,
    "requestedBy" TEXT,
    "requestReceivedAt" DATETIME,
    "endorsedByMayor" BOOLEAN NOT NULL DEFAULT false,
    "responsibleDepartmentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'request_received',
    "summary" TEXT,
    "remarks" TEXT,
    "adoptedAt" DATETIME,
    "signedAt" DATETIME,
    "requesterNotifiedAt" DATETIME,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "resolutions_responsibleDepartmentId_fkey" FOREIGN KEY ("responsibleDepartmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "resolutions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "resolutions_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_resolutions" ("createdAt", "createdBy", "how", "id", "resolutionNumber", "responsibleDepartmentId", "status", "summary", "title", "updatedAt", "updatedBy", "what", "when", "where", "who", "why", "year") SELECT "createdAt", "createdBy", "how", "id", "resolutionNumber", "responsibleDepartmentId", "status", "summary", "title", "updatedAt", "updatedBy", "what", "when", "where", "who", "why", "year" FROM "resolutions";
DROP TABLE "resolutions";
ALTER TABLE "new_resolutions" RENAME TO "resolutions";
CREATE UNIQUE INDEX "resolutions_resolutionNumber_key" ON "resolutions"("resolutionNumber");
CREATE INDEX "resolutions_year_status_idx" ON "resolutions"("year", "status");
CREATE INDEX "resolutions_responsibleDepartmentId_status_idx" ON "resolutions"("responsibleDepartmentId", "status");
CREATE INDEX "resolutions_status_createdAt_idx" ON "resolutions"("status", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "committees_name_key" ON "committees"("name");

-- CreateIndex
CREATE INDEX "committee_members_committeeId_idx" ON "committee_members"("committeeId");

-- CreateIndex
CREATE INDEX "calendar_items_sessionDate_idx" ON "calendar_items"("sessionDate");

-- CreateIndex
CREATE INDEX "calendar_items_resolutionId_idx" ON "calendar_items"("resolutionId");

-- CreateIndex
CREATE INDEX "committee_referrals_resolutionId_idx" ON "committee_referrals"("resolutionId");

-- CreateIndex
CREATE INDEX "committee_referrals_committeeId_idx" ON "committee_referrals"("committeeId");
