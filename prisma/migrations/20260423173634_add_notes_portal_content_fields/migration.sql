-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN "dayOfWeek" TEXT;
ALTER TABLE "ContentItem" ADD COLUMN "fileName" TEXT;
ALTER TABLE "ContentItem" ADD COLUMN "fileType" TEXT;
ALTER TABLE "ContentItem" ADD COLUMN "fileUrl" TEXT;
ALTER TABLE "ContentItem" ADD COLUMN "postTime" TEXT;

-- CreateTable
CREATE TABLE "ClientNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'note',
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "reminderAt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "instagram" TEXT,
    "tiktok" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,
    "notes" TEXT,
    "monthlyRate" REAL,
    "paymentDueDay" INTEGER,
    "portalPin" TEXT,
    "portalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Client" ("company", "createdAt", "email", "facebook", "id", "instagram", "monthlyRate", "name", "notes", "phone", "status", "tiktok", "twitter", "updatedAt", "youtube") SELECT "company", "createdAt", "email", "facebook", "id", "instagram", "monthlyRate", "name", "notes", "phone", "status", "tiktok", "twitter", "updatedAt", "youtube" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE TABLE "new_Deliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "platform" TEXT,
    "dueDate" TEXT,
    "weekOf" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deliverable_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Deliverable" ("clientId", "createdAt", "dueDate", "id", "notes", "platform", "status", "title", "type", "updatedAt", "weekOf") SELECT "clientId", "createdAt", "dueDate", "id", "notes", "platform", "status", "title", "type", "updatedAt", "weekOf" FROM "Deliverable";
DROP TABLE "Deliverable";
ALTER TABLE "new_Deliverable" RENAME TO "Deliverable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
