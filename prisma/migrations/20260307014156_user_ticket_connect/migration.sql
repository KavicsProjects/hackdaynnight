/*
  Warnings:

  - You are about to drop the `_ticketCompetitors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ticketCompetitors" DROP CONSTRAINT "_ticketCompetitors_A_fkey";

-- DropForeignKey
ALTER TABLE "_ticketCompetitors" DROP CONSTRAINT "_ticketCompetitors_B_fkey";

-- DropTable
DROP TABLE "_ticketCompetitors";

-- CreateTable
CREATE TABLE "UserTicketConnect" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userMarkedComplete" BOOLEAN NOT NULL DEFAULT false,
    "acceptedByAuthor" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserTicketConnect_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTicketConnect" ADD CONSTRAINT "UserTicketConnect_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTicketConnect" ADD CONSTRAINT "UserTicketConnect_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
