-- AlterTable
ALTER TABLE "Gossip" DROP COLUMN "canReRead",
ADD COLUMN     "reacted" BOOLEAN NOT NULL DEFAULT false;
