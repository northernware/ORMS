/*
  Warnings:

  - You are about to drop the column `approvalAuthority` on the `ordinances` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ordinances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordinanceNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "who" TEXT,
    "what" TEXT,
    "when" DATETIME,
    "where" TEXT,
    "why" TEXT,
    "how" TEXT,
    "requestedBy" TEXT,
    "requestReceivedAt" DATETIME,
    "decidedAt" DATETIME,
    "remarks" TEXT,
    "departmentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'request_received',
    "summary" TEXT,
    "notes" TEXT,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ordinances_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordinances_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordinances_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ordinances" ("createdAt", "createdBy", "departmentId", "how", "id", "notes", "ordinanceNumber", "status", "summary", "title", "updatedAt", "updatedBy", "what", "when", "where", "who", "why", "year") SELECT "createdAt", "createdBy", "departmentId", "how", "id", "notes", "ordinanceNumber", "status", "summary", "title", "updatedAt", "updatedBy", "what", "when", "where", "who", "why", "year" FROM "ordinances";
DROP TABLE "ordinances";
ALTER TABLE "new_ordinances" RENAME TO "ordinances";
CREATE UNIQUE INDEX "ordinances_ordinanceNumber_key" ON "ordinances"("ordinanceNumber");
CREATE INDEX "ordinances_year_status_idx" ON "ordinances"("year", "status");
CREATE INDEX "ordinances_departmentId_status_idx" ON "ordinances"("departmentId", "status");
CREATE INDEX "ordinances_ordinanceNumber_year_idx" ON "ordinances"("ordinanceNumber", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
