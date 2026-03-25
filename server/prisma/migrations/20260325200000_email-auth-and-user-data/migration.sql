-- AlterTable User: remove username, add email + verification fields
ALTER TABLE "User" DROP COLUMN "username";
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationTokenExpiry" TIMESTAMP(3);

-- CreateIndex for User
DROP INDEX IF EXISTS "User_username_key";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateTable RosterConfig
CREATE TABLE "RosterConfig" (
    "userId" TEXT NOT NULL,
    "config" JSONB NOT NULL,

    CONSTRAINT "RosterConfig_pkey" PRIMARY KEY ("userId")
);

-- AlterTable Player: add userId
ALTER TABLE "Player" ADD COLUMN "userId" TEXT NOT NULL;

-- AlterTable SiegeEvent: add userId
ALTER TABLE "SiegeEvent" ADD COLUMN "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RosterConfig" ADD CONSTRAINT "RosterConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiegeEvent" ADD CONSTRAINT "SiegeEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
