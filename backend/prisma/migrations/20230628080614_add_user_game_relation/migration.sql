-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "playerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
