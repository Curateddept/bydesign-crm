-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
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
INSERT INTO "new_Deliverable" ("clientId", "createdAt", "dueDate", "id", "notes", "platform", "priority", "status", "title", "type", "updatedAt", "weekOf") SELECT "clientId", "createdAt", "dueDate", "id", "notes", "platform", "priority", "status", "title", "type", "updatedAt", "weekOf" FROM "Deliverable";
DROP TABLE "Deliverable";
ALTER TABLE "new_Deliverable" RENAME TO "Deliverable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
