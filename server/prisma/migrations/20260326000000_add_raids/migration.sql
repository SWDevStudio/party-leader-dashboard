CREATE TABLE "Raid" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Raid_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RaidPlayer" (
    "raidId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "RaidPlayer_pkey" PRIMARY KEY ("raidId","playerId")
);

ALTER TABLE "Raid" ADD CONSTRAINT "Raid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RaidPlayer" ADD CONSTRAINT "RaidPlayer_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RaidPlayer" ADD CONSTRAINT "RaidPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
