-- AlterTable: Set default starting balance to 100000 for new users
ALTER TABLE "user" ALTER COLUMN "balance" SET DEFAULT 100000;

-- AlterTable: Add allowedEmails field to tickets (empty array = open to all)
ALTER TABLE "tickets" ADD COLUMN "allowedEmails" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
