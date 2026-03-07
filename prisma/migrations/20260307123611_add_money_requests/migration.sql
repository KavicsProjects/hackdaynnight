-- CreateTable
CREATE TABLE "money_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requesterId" TEXT NOT NULL,
    "requesteeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "money_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "money_requests" ADD CONSTRAINT "money_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "money_requests" ADD CONSTRAINT "money_requests_requesteeId_fkey" FOREIGN KEY ("requesteeId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
