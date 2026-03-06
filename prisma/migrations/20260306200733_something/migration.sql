/*
  Warnings:

  - Added the required column `reward` to the `ticket` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reward" REAL NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "maxFinishers" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ticket" ("content", "createdAt", "id", "maxFinishers", "maxParticipants", "title", "userId") SELECT "content", "createdAt", "id", "maxFinishers", "maxParticipants", "title", "userId" FROM "ticket";
DROP TABLE "ticket";
ALTER TABLE "new_ticket" RENAME TO "ticket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
