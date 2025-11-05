-- DropForeignKey
ALTER TABLE "public"."Waitlist" DROP CONSTRAINT "Waitlist_dropId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Waitlist" DROP CONSTRAINT "Waitlist_userId_fkey";

-- CreateIndex
CREATE INDEX "Waitlist_dropId_claimed_priorityScore_joinedAt_idx" ON "Waitlist"("dropId", "claimed", "priorityScore", "joinedAt");

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
