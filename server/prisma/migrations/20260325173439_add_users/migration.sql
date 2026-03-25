-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "gameSurname" TEXT NOT NULL,
    "discordNick" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "roles" TEXT[],
    "joinedAt" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiegeEvent" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalSlots" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiegeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiegeAttendance" (
    "siegeId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "SiegeAttendance_pkey" PRIMARY KEY ("siegeId","playerId")
);

-- CreateTable
CREATE TABLE "SiegeAbsence" (
    "siegeId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "SiegeAbsence_pkey" PRIMARY KEY ("siegeId","playerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "SiegeAttendance" ADD CONSTRAINT "SiegeAttendance_siegeId_fkey" FOREIGN KEY ("siegeId") REFERENCES "SiegeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiegeAttendance" ADD CONSTRAINT "SiegeAttendance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiegeAbsence" ADD CONSTRAINT "SiegeAbsence_siegeId_fkey" FOREIGN KEY ("siegeId") REFERENCES "SiegeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiegeAbsence" ADD CONSTRAINT "SiegeAbsence_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
