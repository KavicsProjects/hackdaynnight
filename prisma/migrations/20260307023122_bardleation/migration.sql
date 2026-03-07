/*
  Warnings:

  - The primary key for the `user_ticket_connect` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user_ticket_connect` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_ticket_connect" DROP CONSTRAINT "user_ticket_connect_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "user_ticket_connect_pkey" PRIMARY KEY ("userId", "ticketId");
