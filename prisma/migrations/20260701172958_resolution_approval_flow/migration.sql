-- CreateTable
CREATE TABLE "hearings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resolutionId" INTEGER NOT NULL,
    "cycle" INTEGER NOT NULL DEFAULT 1,
    "hearingNumber" INTEGER NOT NULL,
    "heldAt" DATETIME,
    "minutes" TEXT,
    "notes" TEXT,
    "recordedBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hearings_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "resolutions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hearings_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_resolutions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resolutionNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "who" TEXT,
    "what" TEXT,
    "when" DATETIME,
    "where" TEXT,
    "why" TEXT,
    "how" TEXT,
    "approvingBody" TEXT,
    "responsibleDepartmentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "summary" TEXT,
    "feedback" TEXT,
    "hearingCycle" INTEGER NOT NULL DEFAULT 1,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "resolutions_responsibleDepartmentId_fkey" FOREIGN KEY ("responsibleDepartmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "resolutions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "resolutions_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_resolutions" ("approvingBody", "createdAt", "createdBy", "feedback", "how", "id", "resolutionNumber", "responsibleDepartmentId", "status", "summary", "title", "updatedAt", "updatedBy", "what", "when", "where", "who", "why", "year") SELECT "approvingBody", "createdAt", "createdBy", "feedback", "how", "id", "resolutionNumber", "responsibleDepartmentId", "status", "summary", "title", "updatedAt", "updatedBy", "what", "when", "where", "who", "why", "year" FROM "resolutions";
DROP TABLE "resolutions";
ALTER TABLE "new_resolutions" RENAME TO "resolutions";
CREATE INDEX "resolutions_year_status_idx" ON "resolutions"("year", "status");
CREATE INDEX "resolutions_responsibleDepartmentId_status_idx" ON "resolutions"("responsibleDepartmentId", "status");
CREATE INDEX "resolutions_status_createdAt_idx" ON "resolutions"("status", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "hearings_resolutionId_cycle_idx" ON "hearings"("resolutionId", "cycle");

-- CreateIndex
CREATE UNIQUE INDEX "hearings_resolutionId_cycle_hearingNumber_key" ON "hearings"("resolutionId", "cycle", "hearingNumber");
